import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { FaPhone } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import Logo from "../components/Logo";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // چک کردن توکن موجود موقع لود صفحه
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
        if (res.status === 401) {
          setError("شماره تلفن یا رمز عبور اشتباه است");
        } else {
          setError("خطا در ورود. لطفاً دوباره تلاش کنید.");
        }
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
        <Logo width={350} height={60} />
        <div className={styles.inputbox}>
          <input
            className={styles.input}
            type="text"
            placeholder="شماره تلفن"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <FaPhone className={styles.icon} />
        </div>
        <div className={styles.inputbox}>
          <input
            className={styles.input}
            type="password"
            placeholder="رمز عبور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FaLock className={styles.icon} />
        </div>
        <button className={styles.button} type="submit">
          ورود
        </button>
      </form>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
