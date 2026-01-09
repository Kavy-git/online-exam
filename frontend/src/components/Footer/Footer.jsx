import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
        <div className="footer-content">
            <div className="footer-content-left">
                <h1>ZOnline.</h1>
                <p>This website gives you to take test online through real-time monitoring and it is secure and encrypted. </p>
                <div className="footer-social-icons">
                    <img src={assets.instagram_icon} alt="" />
                    <img src={assets.twitter_icon} alt="" />
                    <img src={assets.linkedin_icon} alt="" />
                </div>
            </div>
            <div className="footer-content-center">
                <h2>COMPANY</h2>
                <ul>
                    <li>Home</li>
                    <li>About us</li>
                    <li>Privacy Policy</li>
                </ul>

            </div>
            <div className="footer-content-right">
                <h2>GET IN TOUCH</h2>
                <ul>
                    <li>+1-222-444-888</li>
                    <li>contact@zonline.com</li>
                </ul>
            </div>
        </div>
        <hr/>
        <p className="footer-copyright">Copyright 2025 © ZOnline.com -All Right Reserved.</p>    
    </div>
  )
}

export default Footer
