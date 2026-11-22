import "./HotelsPage.css";

export default function HotelsPage({ hotels, handleSelectHotel }) {
  return (
    <div>
      <h2>רשימת המלונות</h2>
      {hotels.length === 0 ? (
        <p>טוען מלונות...</p>
      ) : (
        hotels.map((hotel) => (
          <div key={hotel.id} className="hotel-card">
            <h3>
              {hotel.name} ({hotel.city}, {hotel.country})
            </h3>
            <p>דירוג כוכבים: {hotel.stars}</p>
            <button
              onClick={() => handleSelectHotel(hotel)}
              className="hotel-details-btn"
            >
              לפרטי המלון
            </button>
          </div>
        ))
      )}
    </div>
  );
}