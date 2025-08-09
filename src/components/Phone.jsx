import styles from "./Form.module.css";
import { FaPhoneAlt } from "react-icons/fa";
function Phone({ phone, setPhone, error }) {
  return (
    <div className={styles.formGroup}>
      <label className={styles.formLabel}>
        <FaPhoneAlt />
        شماره تماس <span className={styles.requiredStar}>*</span>
      </label>
      <input
        className={`${styles.input} ${error ? styles.error : ""}`}
        type="text"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="شماره تماس خود را وارد کنید"
      />
      {error && (
        <small className={`${styles.errorMessage} ${error ? styles.show : ""}`}>
          {error}
        </small>
      )}
    </div>
  );
}

export default Phone;
