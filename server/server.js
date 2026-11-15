import express from "express";
import cors from "cors";
import dotenv from 'dotenv';

dotenv.config();

// ייבוא פריזמה מהקובץ הנפרד שיצרנו
import { prisma } from "./prisma.js";

import { hashPassword, comparePassword, createToken, auth, validateUsernameAndPassword } from "./auth.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ==========================================
// מידלוורס כלליים
// ==========================================
let counter = 0;
app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});

app.use((req, res, next) => {
    counter++;
    console.log(`Counter: ${counter}`);
    next();
});

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// API כללי לבדיקה - נתיב השורש הראשי
app.get("/", (req, res) => {
    res.json({ 
        message: "השרת פעיל ועובד בהצלחה!", 
        status: "success" 
    });
});


// ==========================================
// נתיבי אוטנטיקציה (הרשמה והתחברות)
// ==========================================

app.post("/api/signup", asyncHandler(async (req, res) => {
    let username, password;
    try {
        const validated = validateUsernameAndPassword(req.body);
        username = validated.username;
        password = validated.password;
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }

    // בדיקה האם שם המשתמש כבר קיים בדאטה-בייס (יוניקי)
    const existingUser = await prisma.user.findUnique({
        where: { username },
    });

    if (existingUser) {
        return res.status(409).json({ error: "שם המשתמש כבר קיים במערכת" });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
        data: {
            username,
            password: hashedPassword,
        }
    });

    const token = createToken(newUser);
    res.status(201).json({
        message: "המשתמש נרשם בהצלחה!",
        token,
        userId: newUser.id,
        username: newUser.username
    });
}));

app.post("/api/login", asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
        where: { username },
        include: { 
            bookings: true 
        }
    });

    if (!user) {
        return res.status(400).json({ error: "שם משתמש או סיסמה שגויים" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ error: "שם משתמש או סיסמה שגויים" });
    }

    const token = createToken(user);
    res.json({
        message: "התחברת בהצלחה!",
        token,
        userId: user.id,
        username: user.username,
        bookings: user.bookings 
    });
}));

// ==========================================
// נתיבי מלונות (Hotels Routes)
// ==========================================

app.get("/api/hotels", asyncHandler(async (req, res) => {
    try {
        const hotels = await prisma.hotel.findMany();
        res.json(hotels);
    } catch (err) {
        console.error("שגיאה אמיתית בשליפת מלונות:", err);
        throw err;
    }
}));

// ==========================================
// נתיבי חדרים (Rooms Routes)
// ==========================================

app.get("/api/rooms", asyncHandler(async (req, res) => {
    const rooms = await prisma.room.findMany();
    res.json(rooms);
}));

app.get("/api/rooms/:id", asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const room = await prisma.room.findUnique({
        where: { id }
    });
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json(room);
}));

app.get("/api/hotels/:hotelId/rooms", asyncHandler(async (req, res) => {
    const hotelId = Number(req.params.hotelId);
    const hotelRooms = await prisma.room.findMany({
        where: { hotelId }
    });
    res.json(hotelRooms);
}));

// ==========================================
// נתיבי הזמנות (Orders Routes) - מוגנים ע"י auth!
// ==========================================

app.get("/api/orders/user/:userId", auth, asyncHandler(async (req, res) => {
    const userId = Number(req.params.userId);
    
    if (req.userId !== userId && req.userRole !== 'admin') {
        return res.status(403).json({ error: "אין לך הרשאה לצפות בהזמנות אלו" });
    }

    const userOrders = await prisma.order.findMany({
        where: { userId }
    });
    
    if (userOrders.length === 0) {
        return res.status(404).json({ message: "לא נמצאו הזמנות עבור משתמש זה" });
    }
    res.json(userOrders);
}));

app.post("/api/orders", auth, asyncHandler(async (req, res) => {
    const { hotelId, roomId, startDate, endDate } = req.body;
    const userId = req.userId;

    if (!hotelId || !roomId || !startDate || !endDate) {
        return res.status(400).json({ error: "כל השדות הם חובה (hotelId, roomId, startDate, endDate)" });
    }

    const room = await prisma.room.findUnique({
        where: { id: Number(roomId) }
    });
    if (!room || room.hotelId !== Number(hotelId)) {
        return res.status(404).json({ error: "החדר לא קיים במלון הנבחר" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0); 

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: "פורמט תאריך לא תואם" });
    }
    if (start < now) {
        return res.status(400).json({ error: "אין לבצע הזמנות לתאריכים בעבר" });
    }
    if (end <= start) {
        return res.status(400).json({ error: "תאריך סיום מקדים או שווה לתאריך התחלה" });
    }

    const existingOrders = await prisma.booking.findMany({
        where: { roomId: Number(roomId) }
    });

    const isRoomTaken = existingOrders.some((order) => {
        const orderStart = new Date(order.startDate);
        const orderEnd = new Date(order.endDate);
        return (start < orderEnd && end > orderStart);
    });

    if (isRoomTaken) {
        return res.status(400).json({ error: "החדר לא פנוי בתאריכים המבוקשים" });
    }

    const newOrder = await prisma.booking.create({
        data: {
            userId: Number(userId),
            roomId: Number(roomId),
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            totalPrice: Number(room.price)
        }
    });

    res.status(201).json({
        message: "ההזמנה בוצעה בהצלחה!",
        order: newOrder
    });
}));

app.delete("/api/orders/:id", auth, asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    const order = await prisma.booking.findUnique({ where: { id } });
    if (!order) {
        return res.status(404).json({ error: "ההזמנה לא נמצאה במערכת" });
    }

    if (order.userId !== req.userId && req.userRole !== 'admin') {
        return res.status(403).json({ error: "אין לך הרשאה למחוק הזמנה זו" });
    }

    await prisma.booking.delete({
        where: { id }
    });

    res.json({ message: `הזמנה מספר ${id} בוטלה בהצלחה` });
}));

// מידלוור גלובלי לטיפול בשגיאות
app.use((err, req, res, next) => {
    console.error("❌ שגיאה בשרת:", err.stack);
    res.status(500).json({ error: 'משהו השתבש, נסה שוב מאוחר יותר' });
});

// סגירה תקינה של השרת
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
