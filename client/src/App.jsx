import { useState, useEffect } from "react";
import Navbar from "./components/Navbar/Navbar";
import HomePage from "./Pages/HomePage/HomePage";
import HotelsPage from "./Pages/HotelsPage/HotelsPage";
import HotelDetailsPage from "./Pages/HotelDetailsPage/HotelDetailsPage";
import RoomDetailsPage from "./Pages/RoomDetailsPage/RoomDetailsPage";
import BookingPage from "./Pages/BookingPage/BookingPage";
import LoginForm from "./components/LoginForm/LoginForm";
import RegisterForm from "./components/RegisterForm/RegisterForm";

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
      <Navbar user={user} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />

      {/* תצוגת העמודים */}
      <main style={{ padding: "2rem" }}>
        {currentPage === "home" && <HomePage setCurrentPage={setCurrentPage} />}

        {currentPage === "hotels" && (
          <HotelsPage hotels={hotels} handleSelectHotel={handleSelectHotel} />
        )}

        {currentPage === "hotel-details" && (
          <HotelDetailsPage
            selectedHotel={selectedHotel}
            hotelRooms={hotelRooms}
            setSelectedRoom={setSelectedRoom}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === "room-details" && (
          <RoomDetailsPage
            selectedRoom={selectedRoom}
            handleBookingClick={handleBookingClick}
          />
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