import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma.js";

/******************** bcrypt password hashing functions ********************/
export async function hashPassword(password) {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
}

export async function comparePassword(password, hashedPassword) {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
}

/******************** Token related middleware and functions ********************/
// המפתח הזה בקובץ .env
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

export function createToken(user) {
    return jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "1h" }
    );
}

// Authentication middleware (מותאם ל-Prisma)
export async function auth(req, res, next) {
    //  קבלת ה-Authorization Header מהבקשה
    const header = req.headers.authorization;

    if (!header) {
        return res.status(401).json({ error: "Missing Authorization header" });
    }

    //  חילוץ הטוקן מתוך הפורמט "Bearer <token>"
    const [, token] = header.split(" ");
    if (!token) {
        return res.status(401).json({ error: "Missing Bearer <token>" });
    }

    try {
        //  אימות הטוקן בעזרת ה-JWT Secret
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;

        //  Prisma --> חיפוש המשתמש במסד הנתונים PostgreSQL
        // בפריזמה משתמשים ב-findUnique לפי מפתח ראשי (id)
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        //  שמירת פרטי המשתמש ב-req כדי שהראוטים הבאים יוכלו להשתמש בהם
        req.userId = user.id;
        req.userRole = user.role;
        next();

    } catch (err) {
        console.error("AUTH ERROR:", err);
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}

/******************** Validation function ********************/
// פונקציית עזר שבודקת את תקינות הנתונים שמתקבלים מהלקוח (למשל בהרשמה או התחברות).
export const validateUsernameAndPassword = (body) => {
    const { username, password } = body;
    
    // בדיקה שהשדות בכלל קיימים ולא ריקים
    if (!username || !password) {
        throw new Error("USERNAME_PASSWORD_REQUIRED"); 
    }
    
    // בדיקת תקינות נוספת (למשל אורך סיסמה)
    if (password.length < 6) {
        throw new Error("PASSWORD_TOO_SHORT");
    }

    return { username, password };
};