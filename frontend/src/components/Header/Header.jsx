import React from 'react'
import './Header.css'
import { Link } from 'react-router-dom'

const Header = ({ setShowLogin }) => {

  const storedUser = localStorage.getItem("user");

let user = null;

try {
  user = storedUser && storedUser !== "undefined"
    ? JSON.parse(storedUser)
    : null;
} catch (e) {
  user = null; // invalid JSON fallback
}


  return (
    <div className='header'>
        <div className="header-contents">
            <h2>Screen and Submit</h2>
            <div>
                <p>The webcam stares, a digital, judging eye,</p>
                <p>While knowledge struggles in the Wi-Fi sky.</p>
                <p>One nervous click submits the hurried page,</p>
                <p>A quiet screen now holds the final stage.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
  {user ? (
    <>
      <Link to='/CreateTest'><button>Create Test</button></Link>
      <Link to='/AttemptTest'><button>Attempt Test</button></Link>
    </>
  ) : (
    <>
      <button onClick={() => setShowLogin(true)}>Login to Continue</button>
    </>
  )}
</div>

        </div>
      
    </div>
  )
}

export default Header
