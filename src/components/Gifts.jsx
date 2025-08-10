// Gifts.jsx
import React from "react";
import styles from "./Form.module.css";
import {
  FaGift,
  FaStar,
  FaBoxOpen,
  FaChild,
  FaConciergeBell,
  FaUtensils,
  FaMinus,
  FaPlus,
} from "react-icons/fa";

const GIFT_DEFS = [
  {
    key: "giftAPlus",
    label: "A+",
    fullLabel: "گیفت ممتاز (A+)",
    aria: "گیفت A پلاس",
    icon: <FaStar />,
    vipOnly: true,
  },
  {
    key: "giftA",
    label: "A",
    fullLabel: "گیفت A",
    aria: "گیفت A",
    icon: <FaGift />,
  },
  {
    key: "giftB",
    label: "B",
    fullLabel: "گیفت B",
    aria: "گیفت B",
    icon: <FaBoxOpen />,
  },
  {
    key: "giftService",
    label: "سرویس",
    fullLabel: "خدمت / سرویس",
    aria: "خدمت یا سرویس",
    icon: <FaConciergeBell />,
  },
  {
    key: "giftChild",
    label: "کودک",
    fullLabel: "بستهٔ کودک",
    aria: "بسته کودک",
    icon: <FaChild />,
  },
  {
    key: "food",
    label: "غذا",
    fullLabel: "غذای فوری",
    aria: "غذا",
    icon: <FaUtensils />,
  },
];

function Gifts({ gifts, setGifts, giftVIP }) {
  const update = (key, val) => {
    // نگه داشتن رشته چون فرم شما در submit تبدیل میکنه؛ اما اینجا عدد منفی رو نپذیر
    const sanitized = val === "" ? "" : String(val).replace(/[^\d۰-۹]/g, "");
    setGifts({ ...gifts, [key]: sanitized });
  };

  const step = (key, delta) => {
    const cur = Number(gifts?.[key] || 0);
    const next = Math.max(0, cur + delta);
    setGifts({ ...gifts, [key]: String(next) });
  };

  return (
    <div className={styles.giftsWrap} role="group" aria-label="ورودی‌های گیفت">
      <div className={styles.giftsGrid}>
        {GIFT_DEFS.map((def) => {
          const disabled = def.vipOnly && !giftVIP;
          const value = gifts?.[def.key] ?? "";
          return (
            <div
              key={def.key}
              className={`${styles.giftCard} ${
                disabled ? styles.giftDisabled : ""
              } ${def.vipOnly ? styles.giftAplusCard : ""}`}
              aria-hidden={false}
            >
              <div className={styles.giftTop}>
                <span className={styles.giftIcon} aria-hidden>
                  {def.icon}
                </span>
                <div className={styles.giftTitles}>
                  <div className={styles.giftLabel}>{def.label}</div>
                  <div className={styles.giftFullLabel} title={def.fullLabel}>
                    {def.fullLabel}
                  </div>
                </div>
              </div>

              <div className={styles.giftControl}>
                <button
                  type="button"
                  className={styles.stepBtn}
                  onClick={() => step(def.key, -1)}
                  disabled={disabled || Number(value || 0) <= 0}
                  aria-label={`کم کردن ${def.fullLabel}`}
                >
                  <FaMinus />
                </button>

                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  aria-label={`${def.aria} تعداد`}
                  className={styles.numberInput}
                  value={value}
                  onChange={(e) => update(def.key, e.target.value)}
                  onWheel={(e) => e.currentTarget.blur()} // جلوگیری از تغییر با اسکرول
                  disabled={disabled}
                />

                <button
                  type="button"
                  className={styles.stepBtn}
                  onClick={() => step(def.key, +1)}
                  disabled={disabled}
                  aria-label={`افزودن ${def.fullLabel}`}
                >
                  <FaPlus />
                </button>
              </div>

              {disabled && (
                <div className={styles.giftHint}>
                  <small>فقط در مدیریت VIP قابل انتخاب است</small>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.giftsFooter}>
        <div className={styles.legend}>
          <FaStar /> گیفت A+ فقط برای مدیریت VIP
        </div>
        <div className={styles.helperText}>
          <small>
            تعداد را وارد کنید یا از دکمه‌های + / − استفاده کنید. مقدار منفی
            مجاز نیست.
          </small>
        </div>
      </div>
    </div>
  );
}

export default Gifts;
