import { useState, useEffect } from "react";

const API_URL = "http://localhost:3000/api";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [hotelRooms, setHotelRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // ניהול משתמש מחובר וטוקן
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [redirectAfterLogin, setRedirectAfterLogin] = useState(null);

  // שליפת מלונות מהשרת ברגע שהאפליקציה עולה
  useEffect(() => {
    fetch(`${API_URL}/hotels`)
      .then(res => res.json())
      .then(data => setHotels(data))
      .catch(err => console.error("שגיאה בשליפת מלונות:", err));
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setErrorMsg("");
    if (redirectAfterLogin) {
      setCurrentPage(redirectAfterLogin);
      setRedirectAfterLogin(null);
    } else {
      setCurrentPage("home");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setCurrentPage("home");
  };

  // לחיצה על מעבר לפרטי מלון ושליפת החדרים שלו מהשרת
  const handleSelectHotel = async (hotel) => {
    setSelectedHotel(hotel);
    try {
      const res = await fetch(`${API_URL}/hotels/${hotel.id}/rooms`);
      const rooms = await res.json();
      setHotelRooms(rooms);
      setCurrentPage("hotel-details");
    } catch (err) {
      console.error("שגיאה בשליפת חדרים למלון:", err);
    }
  };

  // בדיקה האם המשתמש מחובר בעת לחיצה על "הזמן"
  const handleBookingClick = (room) => {
    setSelectedRoom(room);
    if (!user) {
      setRedirectAfterLogin("booking");
      setCurrentPage("login");
    } else {
      setCurrentPage("booking");
    }
  };

  return (
    <div dir="rtl" style={{ fontFamily: "Arial, sans-serif", margin: 0 }}>
      {/* סרגל כלים עליון */}
      <nav style={{ display: "flex", justifyContent: "space-between", padding: "1rem 2rem", background: "#6783de", color: "#fff", alignItems: "center" }}>
        <div style={{ fontSize: "1.5rem", fontWeight: "bold", cursor: "pointer" }} onClick={() => setCurrentPage("home")}>
          Booking
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <button onClick={() => setCurrentPage("home")} style={navBtnStyle}>דף הבית</button>
          <button onClick={() => setCurrentPage("hotels")} style={navBtnStyle}>מלונות</button>

          {user ? (
            <>
              <span>שלום, {user.username}</span>
              <button onClick={handleLogout} style={{ padding: "0.4rem 0.8rem", cursor: "pointer" }}>התנתק</button>
            </>
          ) : (
            <>
            <button 
  onClick={() => setCurrentPage("login")} 
  style={{ 
    ...navBtnStyle, 
    background: "#fff", 
    color: "#9dade4", 
    fontWeight: "bold", 
    padding: "0.6rem 1.4rem",    // מגדיל את המרווח הפנימי (עסיסיות)
    borderRadius: "20px",        // מעגל את הפינות בצורה מלאה ומודרנית
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)" // מוסיף הצללה עדינה
  }}
>
  התחברות
</button>

<button 
  onClick={() => setCurrentPage("register")} 
  style={{ 
    ...navBtnStyle, 
    background: "#febb02", 
    color: "#000", 
    fontWeight: "bold", 
    padding: "0.6rem 1.4rem",    // מגדיל את המרווח הפנימי
    borderRadius: "20px",        // מעגל את הפינות בצורה מלאה ומודרנית
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)" // מוסיף הצללה עדינה
  }}
>
  הרשמה
</button>

            </>
          )}
        </div>
      </nav>

      {/* תצוגת העמודים */}
      <main style={{ padding: "2rem" }}>
        {currentPage === "home" && (
          <div style={{ textAlign: "center" }}>
            <h1>ברוכים הבאים</h1>
            <p>כאן תוכלו למצוא את המלונות והחדרים הטובים ביותר לחופשה הבאה שלכם🏖️</p>
            <button onClick={() => setCurrentPage("hotels")} style={{ padding: "0.8rem 1.5rem", background: "#9dade4", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "1rem", marginTop: "1.5rem" }}>
              צפה ברשימת המלונות
            </button>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
              <img
                src="https://images.unsplash.com/photo-1623718649591-311775a30c43?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"
                alt="מלון"
                style={{ maxWidth: "100%", width: "500px", borderRadius: "8px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}
              />
            </div>

          </div>
        )}

        {currentPage === "hotels" && (
          <div>
            <h2>רשימת המלונות</h2>
            {hotels.length === 0 ? <p>טוען מלונות...</p> : (
              hotels.map(hotel => (
                <div key={hotel.id} style={{ border: "1px solid #ccc", padding: "1rem", margin: "1rem 0", borderRadius: "5px" }}>
                  <h3>{hotel.name} ({hotel.city}, {hotel.country})</h3>
                  <p>דירוג כוכבים: {hotel.stars}</p>
                  <button onClick={() => handleSelectHotel(hotel)} style={actionBtnStyle}>
                    לפרטי המלון
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {currentPage === "hotel-details" && (
          <div>
            <h2>פרטי המלון: {selectedHotel?.name}</h2>
            <p>עיר: {selectedHotel?.city} | ארץ: {selectedHotel?.country} | כוכבים: {selectedHotel?.stars}</p>
            <h3>רשימת החדרים במלון:</h3>
            {hotelRooms.length === 0 ? <p>אין חדרים זמינים במלון זה כרגע.</p> : (
              hotelRooms.map(room => (
                <div key={room.id} style={{ border: "1px solid #ddd", padding: "1rem", margin: "0.5rem 0", borderRadius: "4px" }}>
                  <p><strong>{room.name}</strong> | גודל: {room.size} מ"ר | מקסימום אורחים: {room.max_guests}</p>
                  <p>מחיר ללילה: {room.price} ₪</p>
                  <button onClick={() => { setSelectedRoom(room); setCurrentPage("room-details"); }} style={actionBtnStyle}>
                    לפרטי החדר
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {currentPage === "room-details" && (
          <div>
            <h2>פרטי חדר: {selectedRoom?.name}</h2>
            <p>מחיר ללילה: {selectedRoom?.price} ₪</p>
            <p>גודל החדר: {selectedRoom?.size} מ"ר | מקסימום אורחים: {selectedRoom?.max_guests}</p>
            <button onClick={() => handleBookingClick(selectedRoom)} style={{ ...actionBtnStyle, background: "#febb02", color: "#000", fontWeight: "bold", fontSize: "1rem" }}>
              הזמן עכשיו
            </button>
          </div>
        )}

        {currentPage === "booking" && (
          <BookingPage room={selectedRoom} hotelId={selectedHotel?.id} user={user} onBack={() => setCurrentPage("hotels")} />
        )}

        {currentPage === "login" && (
          <LoginForm onLoginSuccess={handleLoginSuccess} switchToRegister={() => setCurrentPage("register")} errorMsg={errorMsg} setErrorMsg={setErrorMsg} />
        )}

        {currentPage === "register" && (
          <RegisterForm onRegisterSuccess={() => setCurrentPage("login")} switchToLogin={() => setCurrentPage("login")} errorMsg={errorMsg} setErrorMsg={setErrorMsg} />
        )}
      </main>
    </div>
  );
}

// קומפוננטת התחברות מדברת עם השרת (/api/login)
function LoginForm({ onLoginSuccess, switchToRegister, errorMsg, setErrorMsg }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "התחברות נכשלה");

      onLoginSuccess({ userId: data.userId, username: data.username, token: data.token });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "2rem", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>התחברות למערכת</h2>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input type="text" placeholder="שם משתמש" value={username} onChange={e => setUsername(e.target.value)} required style={{ padding: "0.5rem" }} />
        <input type="password" placeholder="סיסמה" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: "0.5rem" }} />
        <button type="submit" style={{ padding: "0.6rem", background: "#9dade4", color: "#fff", border: "none", cursor: "pointer" }}>התחבר</button>
      </form>
      <p style={{ marginTop: "1rem" }}>אין לך חשבון? <span onClick={switchToRegister} style={{ color: "blue", cursor: "pointer" }}>להרשמה</span></p>
    </div>
  );
}

// קומפוננטת הרשמה מדברת עם השרת (/api/signup)
function RegisterForm({ onRegisterSuccess, switchToLogin, errorMsg, setErrorMsg }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "הרשמה נכשלה");

      alert("נרשמת בהצלחה! כעת התחברי למערכת.");
      onRegisterSuccess();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "2rem", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>הרשמה לאתר</h2>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input type="text" placeholder="שם משתמש" value={username} onChange={e => setUsername(e.target.value)} required style={{ padding: "0.5rem" }} />
        <input type="password" placeholder="סיסמה" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: "0.5rem" }} />
        <button type="submit" style={{ padding: "0.6rem", background: "#febb02", color: "#000", border: "none", cursor: "pointer" }}>הירשם</button>
      </form>
      <p style={{ marginTop: "1rem" }}>כבר יש לך חשבון? <span onClick={switchToLogin} style={{ color: "#9dade4", cursor: "pointer" }}>להתחברות</span></p>
    </div>
  );
}

// קומפוננטת טופס הזמנה שולחת פקודת POST לשרת עם הטוקן המאומת
function BookingPage({ room, hotelId, user, onBack }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}` // שולח את הטוקן שהתקבל בהתחברות לצורך אימות בשרת
        },
        body: JSON.stringify({
          hotelId: Number(hotelId || room.hotelId),
          roomId: Number(room.id),
          startDate,
          endDate
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ההזמנה נכשלה");

      setMessage(data.message || "ההזמנה בוצעה בהצלחה!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto", border: "1px solid #ccc", padding: "2rem", borderRadius: "8px" }}>
      <h2>טופס ביצוע הזמנה</h2>
      <p><strong>משתמש מזמין:</strong> {user?.username}</p>
      <p><strong>חדר מבוקש:</strong> {room?.name} (מחיר ללילה: {room?.price} ₪)</p>

      {error && <div style={{ background: "#ffe6e6", color: "red", padding: "1rem", marginBottom: "1rem", borderRadius: "4px" }}>{error}</div>}
      {message && <div style={{ background: "#e6ffe6", color: "green", padding: "1rem", marginBottom: "1rem", borderRadius: "4px" }}>{message}</div>}

      <form onSubmit={handleBookingSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <label>תאריך כניסה:
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required style={{ display: "block", width: "100%", padding: "0.4rem", marginTop: "0.3rem" }} />
        </label>
        <label>תאריך עזיבה:
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required style={{ display: "block", width: "100%", padding: "0.4rem", marginTop: "0.3rem" }} />
        </label>

        <button type="submit" style={{ padding: "0.6rem 1.2rem", background: "green", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
          שלח הזמנה
        </button>
      </form>
      <button onClick={onBack} style={{ marginTop: "1rem", background: "transparent", border: "none", color: "blue", cursor: "pointer", textDecoration: "underline" }}>
        חזרה למלונות
      </button>
    </div>
  );
}

const navBtnStyle = { background: "transparent", color: "#fff", border: "none", cursor: "pointer", fontSize: "1rem" };
const actionBtnStyle = { padding: "0.4rem 0.8rem", background: "#9dade4", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", marginTop: "0.5rem" };

