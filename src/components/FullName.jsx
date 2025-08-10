// FullName.jsx
import React, { useRef } from "react";
import styles from "./Form.module.css";
import { MdDriveFileRenameOutline } from "react-icons/md";

function FullName({ fullName, setFullName, error, activity }) {
  const inputRef = useRef(null);

  const SUGGESTIONS = ["عباس مرجانی", "علی مرجانی", "مهدی مرجانی"];

  const handleSuggestionClick = (name) => {
    setFullName(name);
    // بازگرداندن فوکوس به input برای تجربهٔ بهتر کیبورد/دستگاه لمسی
    inputRef.current?.focus();
  };

  return (
    <div className={styles.formGroup}>
      <label className={styles.formLabel}>
        <MdDriveFileRenameOutline />
        نام و نام خانوادگی <span className={styles.requiredStar}>*</span>
      </label>

      <input
        ref={inputRef}
        className={`${styles.input} ${error ? styles.error : ""}`}
        type="text"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="نام کامل خود را وارد کنید"
        aria-invalid={!!error}
        aria-describedby={error ? "fullname-error" : undefined}
      />

      {error && (
        <small
          id="fullname-error"
          className={`${styles.errorMessage} ${styles.show}`}
        >
          {error}
        </small>
      )}

      {/* suggestions — فقط وقتی Activity == "مدیریت VIP" */}
      {activity === "مدیریت VIP" && (
        <div
          className={styles.nameSuggestions}
          role="list"
          aria-label="پیشنهاد اسامی"
        >
          {SUGGESTIONS.map((name) => (
            <button
              key={name}
              type="button"
              className={styles.suggestionBtn}
              onClick={() => handleSuggestionClick(name)}
              aria-label={`انتخاب ${name}`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default FullName;
