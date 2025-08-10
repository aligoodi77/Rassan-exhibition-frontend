import styles from "./Form.module.css";
import { MdDriveFileRenameOutline } from "react-icons/md";

function FullName({ fullName, setFullName, error }) {
  return (
    <div className={styles.formGroup}>
      <label className={styles.formLabel}>
        <MdDriveFileRenameOutline />
        نام و نام خانوادگی <span className={styles.requiredStar}>*</span>{" "}
      </label>
      <input
        className={`${styles.input} ${error ? styles.error : ""}`}
        type="text"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="نام کامل خود را وارد کنید"
      />
      {error && (
        <small className={`${styles.errorMessage} ${styles.show}`}>
          {error}
        </small>
      )}
    </div>
  );
}
export default FullName;
