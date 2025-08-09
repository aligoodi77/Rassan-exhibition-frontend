import styles from "./Form.module.css";
import { FaCity } from "react-icons/fa";
function City({ city, setCity, error }) {
  return (
    <div className={styles.formGroup}>
      <label className={styles.formLabel}>
        <FaCity />
        شهرستان <span className={styles.requiredStar}>*</span>
      </label>
      <input
        className={`${styles.input} ${error ? styles.error : ""}`}
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      {error && (
        <small className={`${styles.errorMessage} ${error ? styles.show : ""}`}>
          {error}
        </small>
      )}
    </div>
  );
}

export default City;
