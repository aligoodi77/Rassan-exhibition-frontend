import React from "react";
import styles from "./Form.module.css";

export default function Modal({ show, title, message, onClose }) {
  if (!show) return null; // اگر show=false باشد، مودال رندر نشود

  return (
    <div
      className={`${styles.modalOverlay} ${show ? styles.show : ""}`}
      onClick={onClose}
    >
      <div
        className={`${styles.modalContent} ${show ? styles.show : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={styles.modalTitle}>{title}</h3>
        <p className={styles.modalMessage}>{message}</p>
        <button className={styles.modalButton} onClick={onClose}>
          بستن
        </button>
      </div>
    </div>
  );
}
