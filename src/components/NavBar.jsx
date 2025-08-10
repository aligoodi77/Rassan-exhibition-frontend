// NavBar.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaBars, FaTimes } from "react-icons/fa";
import Logo from "./Logo";
import "./NavBar.css";

function safeDecodeJwt(token) {
  try {
    const base64Url = token.split(".")[1] || "";
    // convert base64url -> base64
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    // pad with '='
    while (base64.length % 4) base64 += "=";
    // Decode UTF-8 safely
    const binary = atob(base64);
    // decode UTF-8
    const json = decodeURIComponent(
      binary
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch (err) {
    console.warn("Invalid JWT payload or decode failed", err);
    return null;
  }
}

function initialsFromName(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function NavBar({ deviceType }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const userBlockRef = useRef(null);
  const [userName, setUserName] = useState("کاربر");
  const [role, setRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    if (!token || !storedRole) {
      // do not force redirect immediately here to avoid interfering with route guards
      setRole(storedRole || "");
      return;
    }

    const payload = safeDecodeJwt(token);
    if (payload && payload.name) {
      setUserName(String(payload.name));
    } else {
      // fallback: use stored name in localStorage if present
      const storedName = localStorage.getItem("name");
      if (storedName) setUserName(storedName);
    }
    setRole(storedRole);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        userBlockRef.current &&
        !userBlockRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    navigate("/login");
  };

  const avatarInitials = initialsFromName(userName);

  // accessible keyboard toggles for dropdown
  const onKeyToggle = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setShowDropdown((s) => !s);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setMobileOpen(false);
    }
  };

  // menu items
  const menu = [
    ...(role === "admin"
      ? [{ label: "لیست درخواست‌ها", action: () => navigate("/requests") }]
      : []),
    ...(["admin", "expert", "promoter"].includes(role)
      ? [{ label: "ثبت درخواست جدید", action: () => navigate("/form") }]
      : []),
    { label: "خروج", action: handleLogout, danger: true },
  ];

  return (
    <header className={`navbar-top ${deviceType}`}>
      <div className="navbar-left">
        <div
          className="logo-wrap"
          onClick={() => navigate("/")}
          role="button"
          tabIndex={0}
          aria-label="خانه"
        >
          <Logo
            width={
              deviceType === "mobile" ? 80 : deviceType === "tablet" ? 100 : 120
            }
          />
        </div>
      </div>

      <div className="navbar-right" ref={userBlockRef}>
        {/* Desktop / Tablet user block */}
        <div
          className="user-info"
          onClick={() => setShowDropdown((s) => !s)}
          onKeyDown={onKeyToggle}
          role="button"
          tabIndex={0}
          aria-expanded={showDropdown}
          aria-haspopup="menu"
        >
          <div className="avatar" aria-hidden>
            {avatarInitials}
          </div>
          <div className="user-meta">
            <div className="navbar-user" title={userName}>
              {userName}
            </div>
            <div className="user-role">{role || "کاربر"}</div>
          </div>
          <div className="chev">{showDropdown ? <FaTimes /> : <FaBars />}</div>
        </div>

        {/* dropdown */}
        <nav
          className={`dropdown-menu ${showDropdown ? "open" : ""}`}
          role="menu"
          aria-hidden={!showDropdown}
        >
          {menu.map((it) => (
            <button
              key={it.label}
              className={`dropdown-item ${it.danger ? "logout" : ""}`}
              onClick={() => {
                it.action();
                setShowDropdown(false);
              }}
              role="menuitem"
            >
              {it.label}
            </button>
          ))}
        </nav>

        {/* Mobile compact toggle (floating) */}
        <button
          className="mobile-hamburger"
          aria-label="باز کردن منو"
          onClick={() => setMobileOpen((s) => !s)}
        >
          {mobileOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Mobile slide-in menu */}
        <div
          className={`mobile-panel ${mobileOpen ? "open" : ""}`}
          aria-hidden={!mobileOpen}
        >
          <div className="mobile-panel-inner">
            <div className="mobile-user">
              <div className="avatar large">{avatarInitials}</div>
              <div>
                <div className="navbar-user">{userName}</div>
                <div className="user-role">{role || "کاربر"}</div>
              </div>
            </div>

            <div className="mobile-menu-items">
              {menu.map((it) => (
                <button
                  key={it.label}
                  className={`dropdown-item ${it.danger ? "logout" : ""}`}
                  onClick={() => {
                    it.action();
                    setMobileOpen(false);
                  }}
                >
                  {it.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
