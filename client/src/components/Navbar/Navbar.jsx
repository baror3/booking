import "./Navbar.css";

export default function Navbar({ user, setCurrentPage, handleLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => setCurrentPage("home")}>
        Booking
      </div>
      <div className="navbar-links">
        <button onClick={() => setCurrentPage("home")} className="nav-btn">דף הבית</button>
        <button onClick={() => setCurrentPage("hotels")} className="nav-btn">מלונות</button>

        {user ? (
          <>
            <span>שלום, {user.username}</span>
            <button onClick={handleLogout} className="btn-logout">התנתק</button>
          </>
        ) : (
          <>
            <button onClick={() => setCurrentPage("login")} className="btn-login">התחברות</button>
            <button onClick={() => setCurrentPage("register")} className="btn-register">הרשמה</button>
          </>
        )}
      </div>
    </nav>
  );
}