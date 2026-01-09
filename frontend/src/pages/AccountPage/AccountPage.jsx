import React, { useState } from "react";
import "./AccountPage.css";
import axios from "axios";


const AccountPage = () => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [showNamePopup, setShowNamePopup] = useState(false);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  if (!user) {
    return (
      <div className="account-container">
        <h2>Please login to view account details.</h2>
      </div>
    );
  }

 const saveName = async () => {
  try {
    const res = await axios.put(
      "http://localhost:4000/api/user/update-name",
      { name: newName },
      { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
    );

    localStorage.setItem("user", JSON.stringify(res.data.user));
    setShowNamePopup(false);
    window.location.reload();
  } catch (err) {
  console.log("UPDATE ERROR:", err.response?.data);
  alert("Failed to update");
}
};


  const savePassword = async () => {
  try {
    await axios.put(
      "http://localhost:4000/api/user/update-password",
      { password: newPassword },
      { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
    );

    alert("Password updated successfully!");
    setShowPasswordPopup(false);
  } catch (err) {
  console.log("UPDATE ERROR:", err.response?.data);
  alert("Failed to update");
}
};

  const handleDeleteAccount = async () => {
  if (!window.confirm("Are you sure you want to delete your account permanently?")) {
    return;
  }

  try {
    await axios.delete("http://localhost:4000/api/user/delete", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    localStorage.clear();
    window.location.href = "/?login=true";
    console.log("TOKEN SENT:", localStorage.getItem("token"));

  } catch (err) {
  console.log("UPDATE ERROR:", err.response?.data);
  alert("Failed to update");
}
};


  return (
    <div className="account-container">
      <h1 className="account-title">Your Account</h1>

      <div className="account-card">

        <div className="account-item">
          <p className="label">Name:</p>
          <p className="value">{user.name}</p>
          <button className="edit-btn" onClick={() => setShowNamePopup(true)}>
            Edit
          </button>
        </div>

        <div className="account-item">
          <p className="label">Email:</p>
          <p className="value">{user.email}</p>
        </div>

       <div className="account-item">
  <p className="label">Password:</p>

  <input
    type={showPassword ? "text" : "password"}
    className="password-display"
    value="12345678"
    disabled
  />

  <button
    className="toggle-btn"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? "Hide" : "Show"}
  </button>

  <button className="edit-btn" onClick={() => setShowPasswordPopup(true)}>
    Change
  </button>
</div>

        <div className="account-item delete-section">
  <button className="delete-btn" onClick={handleDeleteAccount}>
    Delete Account
  </button>
</div>
      </div>

      {/* EDIT NAME POPUP */}
      {showNamePopup && (
        <div className="popup">
          <div className="popup-box">
            <h3>Edit Name</h3>
            <input
              type="text"
              placeholder="Enter new name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />

            <button onClick={saveName}>Save</button>
            <button className="cancel" onClick={() => setShowNamePopup(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD POPUP */}
      {showPasswordPopup && (
        <div className="popup">
          <div className="popup-box">
            <h3>Change Password</h3>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <button onClick={savePassword}>Save</button>
            <button className="cancel" onClick={() => setShowPasswordPopup(false)}>Cancel</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AccountPage;
