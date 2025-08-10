import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaBars, FaTimes } from "react-icons/fa";
import Logo from "./Logo";
import "./NavBar.css";

export default function NavBar({ deviceType }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const userBlockRef = useRef();
  const [userName, setUserName] = useState("کاربر");
  const [role, setRole] = useState("");

  // چک کردن توکن و نقش کاربر
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (!token || !storedRole) {
      navigate("/login");
      return;
    }

    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(decodeURIComponent(atob(base64))); // اضافه کردن decodeURIComponent
      setUserName(payload.name ? decodeURIComponent(payload.name) : "کاربر"); // اطمینان از رمزگشایی درست
      setRole(storedRole);
    } catch (err) {
      console.error("خطا در رمزگشایی توکن:", err.message);
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // مدیریت کلیک خارج از dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        userBlockRef.current &&
        !userBlockRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logoSize = {
    mobile: { width: 80, height: 30 },
    tablet: { width: 100, height: 35 },
    laptop: { width: 120, height: 40 },
  };

  // نمایش نام کوتاه‌تر برای موبایل
  const displayName =
    deviceType === "mobile" && userName.length > 10
      ? userName.split(" ")[0]
      : userName;

  return (
    <header className={`navbar-top ${deviceType}`}>
      <div className="navbar-left">
        <Logo {...logoSize[deviceType]} />
      </div>

      <div className="navbar-right" ref={userBlockRef}>
        <div
          className="user-info"
          onClick={() => setShowDropdown(!showDropdown)}
          style={{ cursor: "pointer" }}
        >
          <FaUser className="user-icon" />
          <span className="navbar-user">
            <strong>{displayName}</strong>
          </span>
          {showDropdown ? (
            <FaTimes className="dropdown-icon" />
          ) : (
            <FaBars className="dropdown-icon" />
          )}
        </div>

        {showDropdown && (
          <div className="dropdown-menu">
            {role === "admin" && (
              <button
                className="dropdown-item"
                onClick={() => navigate("/requests")}
              >
                لیست درخواست‌ها
              </button>
            )}
            {["admin", "expert", "promoter"].includes(role) && (
              <button
                className="dropdown-item"
                onClick={() => navigate("/form")}
              >
                ثبت درخواست جدید
              </button>
            )}
            <button className="dropdown-item logout" onClick={handleLogout}>
              خروج
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
