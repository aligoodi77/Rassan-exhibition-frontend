import React from "react";
import styles from "./Form.module.css";

export default function Modal({ title, message, onClose }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>{title}</h3>
        <p className={styles.modalMessage}>{message}</p>
        <button className={styles.modalButton} onClick={onClose}>
          بستن
        </button>
      </div>
    </div>
  );
}
