import React, { useState } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'

// 👉 ADD THESE
// {/* import { GoogleLogin } from "@react-oauth/google"; */}
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";




const LoginPopup = ({ setShowLogin }) => {
  const [showPassword, setShowPassword] = useState(false);


  
  const [currState, setCurrState] = useState("Login")
  const [data, setData] = useState({
    name: "",
    email: "",
    password: ""
  })

  // 👉 ADD
  const navigate = useNavigate();

  const onChangehandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }))
  }
const onLogin = async (e) => {
  e.preventDefault();

  // 🔥 LOGIN MODE
  if (currState === "Login") {
    try {
      const res = await axios.post("http://localhost:4000/api/user/login", {
        email: data.email,
        password: data.password,
      });

      if (!res.data.success) {
        alert(res.data.message);
        return;
      }

      localStorage.setItem("token", res.data.token);
      if (res.data.user) {
  localStorage.setItem("user", JSON.stringify(res.data.user));
} else {
  localStorage.removeItem("user");
}


     toast.success("Logged in successfully!");
setShowLogin(false);
navigate("/");


    } catch (error) {
      console.log(error);
      alert("Server error during login");
    }
  }

  // 🔥 SIGNUP MODE
  if (currState === "Sign Up") {
    try {
      const res = await axios.post("http://localhost:4000/api/user/register", {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (!res.data.success) {
        alert(res.data.message);
        return;
      }

      // If signup success, auto-login
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Account created successfully!");
setShowLogin(false);
navigate("/");


    } catch (error) {
      console.log(error);
      alert("Server error during signup");
    }
  }
};


  

  // 👉 ADD GOOGLE SUCCESS HANDLER
  const handleGoogleSuccess = async (response) => {
    try {
      const credential = response.credential;

      const res = await axios.post(
        "http://localhost:4000/api/user/google",
        { credential }
      );

      const { user, token } = res.data;

      localStorage.setItem("token", token);
      if (user) {
  localStorage.setItem("user", JSON.stringify(user));
} else {
  localStorage.removeItem("user");
}


      toast.success("Google login successful!");
setShowLogin(false);
navigate("/");


    } catch (error) {
      console.log(error);
      alert("Google Login Failed on server!");
    }
  };

  // 👉 ADD GOOGLE ERROR HANDLER
  const handleGoogleError = () => {
    alert("Google Login Failed!");
  };

  return (
  <div className='login-popup'>
   <form
  className="login-popup-container"
  onSubmit={onLogin}

>


      <div className="login-popup-title">
        <h2>{currState}</h2>
        <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="close" />
      </div>

      <div className="login-popup-inputs">
        {currState === "Login" ? null : (
          <input name='name' onChange={onChangehandler} value={data.name} type="text" placeholder="Your Name" required />
        )}
        <input name='email' onChange={onChangehandler} value={data.email} type="email" placeholder="Your Email" required />
        <div className="password-wrapper">
  <input
    name='password'
    onChange={onChangehandler}
    value={data.password}
    type={showPassword ? "text" : "password"}   // 👈 change type dynamically
    placeholder="Password"
    required
  />

  <span
    className="toggle-password"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? "Hide" : "Show"}
  </span>
</div>

      </div>

      <button
  type="submit"
>
  {currState === "Sign Up" ? "Create Account" : "Login"}
</button>


      <div className="login-popup-condition">
        <input type="checkbox" required />
        <p>By continuing, I agree to the <a href="#">terms of use</a> & <a href="#">privacy policy</a>.</p>
      </div>

      {currState === "Login" ? (
        <p>
          Create a New Account?{" "}
          <span onClick={() => setCurrState("Sign Up")}>Click Here</span>
        </p>
      ) : (
        <p>
          Already have an Account?{" "}
          <span onClick={() => setCurrState("Login")}>Login Here</span>
        </p>
      )}
      {/* Google Login temporarily disabled */}
    </form>

   

  </div>
);

}

export default LoginPopup
