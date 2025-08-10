import styles from "./Form.module.css";

function Gender({ gender, setGender, error }) {
  return (
    <div className={styles.formGroup}>
      <label className={styles.formLabel}>
        جنسیت <span className={styles.requiredStar}>*</span>
      </label>
      <div className={styles.radioGroup}>
        <label className={styles.radioOption}>
          <input
            type="radio"
            name="gender"
            value="آقا"
            checked={gender === "آقا"}
            onChange={(e) => setGender(e.target.value)}
          />
          آقا
        </label>
        <label className={styles.radioOption}>
          <input
            type="radio"
            name="gender"
            value="خانم"
            checked={gender === "خانم"}
            onChange={(e) => setGender(e.target.value)}
          />
          خانم
        </label>
      </div>
      {error && (
        <small className={`${styles.errorMessage} ${styles.show}`}>
          {error}
        </small>
      )}
    </div>
  );
}

export default Gender;
