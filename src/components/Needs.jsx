import styles from "./Form.module.css";

function Needs({ onClick, needs }) {
  return (
    <div className={styles.formGroup}>
      <div className={styles.checkboxGrid}>
        {[
          "کاتالوگ",
          "لیست قیمت",
          "کارت ویزیت",
          "نمونه محصول",
          "فرم درخواست نمایندگی",
          "برگزاری جلسه حضوری و مذاکره",
        ].map((item) => (
          <label className={styles.checkboxOption} key={item}>
            <input
              type="checkbox"
              checked={needs.includes(item)}
              onChange={() => onClick(item)}
              className={styles.hiddenCheckbox} // Added class for hidden native checkbox
            />
            <span className={styles.customCheckbox}></span>{" "}
            {/* Custom visual checkbox */}
            <p className={styles.p}>{item}</p>
          </label>
        ))}
      </div>
    </div>
  );
}

export default Needs;
