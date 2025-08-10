import styles from "./Form.module.css";
import { FaBriefcase } from "react-icons/fa";

function Activity({ activity, setActivity, error }) {
  return (
    <div className={styles.formGroup}>
      <label className={styles.formLabel}>
        <FaBriefcase />
        زمینه فعالیت <span className={styles.requiredStar}>*</span>
      </label>
      <select
        className={`${styles.select} ${error ? styles.error : ""}`}
        name="activity"
        value={activity}
        onChange={(e) => setActivity(e.target.value)}
      >
        <option value="">انتخاب کنید</option>
        {[
          "نماینده فعلی شرکت",
          "درخواست نمایندگی",
          "پروژه (سازنده)",
          "طراح (آرشیتکت)",
          "صادرات",
          "خدمات پس از فروش (تکنسین یا مجری)",
          "تامین کننده",
          "مصرف کننده",
          "سایر",
          "مدیریت VIP",
        ].map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      {error && (
        <small className={`${styles.errorMessage} ${styles.show}`}>
          {error}
        </small>
      )}
    </div>
  );
}

export default Activity;
