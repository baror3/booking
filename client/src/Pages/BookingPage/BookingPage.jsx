// קומפוננטת טופס הזמנה שולחת פקודת POST לשרת עם הטוקן המאומת

import { useState } from "react";
import "./BookingPage.css";

const API_URL = "http://localhost:3000/api";

export default function BookingPage({ room, hotelId, user, onBack }) {
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
          "Authorization": `Bearer ${user.token}`
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
    <div className="booking-container">
      <h2>טופס ביצוע הזמנה</h2>
      <p><strong>משתמש מזמין:</strong> {user?.username}</p>
      <p><strong>חדר מבוקש:</strong> {room?.name} (מחיר ללילה: {room?.price} ₪)</p>

      {error && <div className="booking-error">{error}</div>}
      {message && <div className="booking-success">{message}</div>}

      <form onSubmit={handleBookingSubmit} className="booking-form">
        <label>
          תאריך כניסה:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="booking-input"
          />
        </label>
        <label>
          תאריך עזיבה:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="booking-input"
          />
        </label>

        <button type="submit" className="booking-submit-btn">
          שלח הזמנה
        </button>
      </form>
      <button onClick={onBack} className="booking-back-btn">
        חזרה למלונות
      </button>
    </div>
  );
}