import styles from "./Form.module.css";
import { FaComment } from "react-icons/fa";
function Description({ description, setDescription }) {
  return (
    <div className={styles.formGroup}>
      <label className={styles.formLabel}>
        {" "}
        <FaComment /> توضیحات
      </label>
      <textarea
        className={styles.textarea}
        rows="3"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="توضیحات خود را وارد کنید..."
      />
    </div>
  );
}
export default Description;
