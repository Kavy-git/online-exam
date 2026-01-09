import React, { useState, useEffect } from 'react' 
import './Navbar.css' 
import { assets } from '../../assets/assets' 
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ setShowLogin }) => {
  
  // 👉 Get user from localStorage
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [menu, setMenu] = useState("Home");
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  

  // 👉 Auto highlight "Test" when URL becomes /Test
  useEffect(() => {
    if (location.pathname === "/Test") {
      setMenu("Test");
    }
  }, [location.pathname]);

  return (
    <div className='navbar'> 

      <Link to='/'>
        <img src={assets.logo} alt="" className='logo' /> 
      </Link>

      <ul className="navbar-menu"> 
        <Link 
          to='/' 
          onClick={() => setMenu("Home")}
          className={menu === "Home" ? "active" : ""}
        >
          Home
        </Link>

        <Link 
  to={user ? '/Test' : '#'}
  onClick={() => {
    if (!user) setShowLogin(true);
    else setMenu("Test");
  }}
  className={menu === "Test" ? "active" : ""} >
  Test
</Link>


        <a 
          href='#footer'
          onClick={() => setMenu("Contact-us")}
          className={menu === "Contact-us" ? "active" : ""}
        >
          Contact-us
        </a>
      </ul> 

      <div className="navbar-right"> 
  

  {/* ⭐ If NOT logged in */}
  {!user && (
    <button onClick={() => setShowLogin(true)}>Sign In</button>
  )}

  {/* ⭐ If LOGGED in */}
  {user && (
    <div className="navbar-user">
      <p 
        className="navbar-username"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        Hi, {user.name}
      </p>

      {dropdownOpen && (
  <div className="navbar-dropdown">
    
    {/* ⭐ Account Details */}
    <button 
      className="dropdown-item"
      onClick={() => {
        // Navigate to Account Page
        window.location.href = "/account";
      }}
    >
      Account Details
    </button>

    {/* ⭐ Logout */}
    <button 
      className="logout-btn"
      onClick={() => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.reload();
      }}
    >
      Logout
    </button>

  </div>
)}

    </div>
  )}
</div>


    </div>
  ) 
}

export default Navbar;
