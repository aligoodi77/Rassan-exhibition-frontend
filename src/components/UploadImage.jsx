import styles from "./Form.module.css";
function UploadImage() {
  return (
    <div>
      <div className={styles.formGroup}>
        <label className={styles.label}>آپلود عکس</label>
        <input type="file" />
      </div>
    </div>
  );
}

export default UploadImage;
