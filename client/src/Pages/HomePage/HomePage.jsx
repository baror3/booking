import "./HomePage.css";

export default function HomePage({ setCurrentPage }) {
  return (
    <div className="home-container">
      <h1>ברוכים הבאים</h1>
      <p>כאן תוכלו למצוא את המלונות והחדרים הטובים ביותר לחופשה הבאה שלכם🏖️</p>
      <button onClick={() => setCurrentPage("hotels")} className="home-btn">
        צפה ברשימת המלונות
      </button>
      <div className="home-image-wrapper">
        <img
          src="https://images.unsplash.com/photo-1623718649591-311775a30c43?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"
          alt="מלון"
          className="home-image"
        />
      </div>
    </div>
  );
}