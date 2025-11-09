import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPhone, FaLock } from "react-icons/fa";
import Logo from "../components/Logo";
import styles from "./Login.module.css";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && ["admin", "expert", "promoter"].includes(role)) {
      navigate("/form");
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    // fake login frontend-only
    if (phone === "09123456789" && password === "1234") {
      localStorage.setItem("token", "fakeToken");
      localStorage.setItem("role", "admin");
      navigate("/form");
    } else {
      setError("شماره تلفن یا رمز عبور اشتباه است");
    }
  };

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleLogin}>
        <Logo width={280} height={55} />

        <div className={styles.inputBox}>
          <FaPhone className={styles.icon} />
          <input
            className={styles.input}
            type="text"
            placeholder="شماره تلفن"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className={styles.inputBox}>
          <FaLock className={styles.icon} />
          <input
            className={styles.input}
            type="password"
            placeholder="رمز عبور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className={styles.button} type="submit">
          ورود
        </button>

        {error && <p className={styles.error}>{error}</p>}
      </form>
    </div>
  );
}
