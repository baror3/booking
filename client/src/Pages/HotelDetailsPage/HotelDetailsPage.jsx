import "./HotelDetailsPage.css";

export default function HotelDetailsPage({
  selectedHotel,
  hotelRooms,
  setSelectedRoom,
  setCurrentPage,
}) {
  return (
    <div>
      <h2>פרטי המלון: {selectedHotel?.name}</h2>
      <p>
        עיר: {selectedHotel?.city} | ארץ: {selectedHotel?.country} | כוכבים:{" "}
        {selectedHotel?.stars}
      </p>
      <h3>רשימת החדרים במלון:</h3>
      {hotelRooms.length === 0 ? (
        <p>אין חדרים זמינים במלון זה כרגע.</p>
      ) : (
        hotelRooms.map((room) => (
          <div key={room.id} className="room-card">
            <p>
              <strong>{room.name}</strong> | גודל: {room.size} מ"ר | מקסימום
              אורחים: {room.max_guests}
            </p>
            <p>מחיר ללילה: {room.price} ₪</p>
            <button
              onClick={() => {
                setSelectedRoom(room);
                setCurrentPage("room-details");
              }}
              className="room-details-btn"
            >
              לפרטי החדר
            </button>
          </div>
        ))
      )}
    </div>
  );
}