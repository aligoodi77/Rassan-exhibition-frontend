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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:8800/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      if (!res.ok) {
        setError(
          res.status === 401
            ? "شماره تلفن یا رمز عبور اشتباه است"
            : "خطا در ورود. لطفاً دوباره تلاش کنید."
        );
        return;
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      if (["admin", "expert", "promoter"].includes(data.role)) {
        navigate("/form");
      } else {
        setError("نقش کاربر مجاز نیست");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
      }
    } catch (err) {
      console.error("Error in login:", err);
      setError("خطا در ارتباط با سرور. لطفاً بعداً تلاش کنید.");
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
