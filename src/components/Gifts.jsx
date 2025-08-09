import styles from "./Form.module.css";

function Gifts({ gifts, setGifts, giftVIP }) {
  return (
    <div className={styles.formGroup}>
      <div className={styles.formRow}>
        {[
          { key: "giftAPlus", label: "گیفت A+", disabled: !giftVIP },
          { key: "giftA", label: "گیفت A" },
          { key: "giftB", label: "گیفت B" },
          { key: "giftService", label: "گیفت services" },
          { key: "giftChild", label: "گیفت کودک" },
          { key: "food", label: "غذا" },
        ].map((item) => (
          <div className={styles.formGroup} key={item.key}>
            <input
              className={`${styles.input} ${
                item.disabled ? styles.disabled : ""
              }`}
              type="number"
              placeholder={item.label}
              disabled={item.disabled}
              value={gifts[item.key]}
              onChange={(e) =>
                setGifts({ ...gifts, [item.key]: e.target.value })
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Gifts;
