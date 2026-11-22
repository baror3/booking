import "./RoomDetailsPage.css";

export default function RoomDetailsPage({ selectedRoom, handleBookingClick }) {
  return (
    <div>
      <h2>פרטי חדר: {selectedRoom?.name}</h2>
      <p>מחיר ללילה: {selectedRoom?.price} ₪</p>
      <p>
        גודל החדר: {selectedRoom?.size} מ"ר | מקסימום אורחים:{" "}
        {selectedRoom?.max_guests}
      </p>
      <button
        onClick={() => handleBookingClick(selectedRoom)}
        className="book-now-btn"
      >
        הזמן עכשיו
      </button>
    </div>
  );
}