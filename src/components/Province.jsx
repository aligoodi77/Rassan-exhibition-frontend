import Select from "react-select";
import styles from "./Form.module.css";
import { FaLocationDot } from "react-icons/fa6";
const provinces = [
  { value: "azarbayjan-sharghi", label: "استان آذربایجان شرقی" },
  { value: "azarbayjan-gharbi", label: "استان آذربایجان غربی" },
  { value: "ardebil", label: "استان اردبیل" },
  { value: "esfahan", label: "استان اصفهان" },
  { value: "alborz", label: "استان البرز" },
  { value: "ilam", label: "استان ایلام" },
  { value: "bushehr", label: "استان بوشهر" },
  { value: "tehran", label: "استان تهران" },
  { value: "chaharmahal-bakhtiari", label: "استان چهارمحال و بختیاری" },
  { value: "khorasan-jonubi", label: "استان خراسان جنوبی" },
  { value: "khorasan-razavi", label: "استان خراسان رضوی" },
  { value: "khorasan-shomali", label: "استان خراسان شمالی" },
  { value: "khuzestan", label: "استان خوزستان" },
  { value: "zanjan", label: "استان زنجان" },
  { value: "semnan", label: "استان سمنان" },
  { value: "sistan-baluchestan", label: "استان سیستان و بلوچستان" },
  { value: "fars", label: "استان فارس" },
  { value: "qazvin", label: "استان قزوین" },
  { value: "qom", label: "استان قم" },
  { value: "kordestan", label: "استان کردستان" },
  { value: "kerman", label: "استان کرمان" },
  { value: "kermanshah", label: "استان کرمانشاه" },
  { value: "kohgiluyeh-boyer-ahmad", label: "استان کهگیلویه و بویراحمد" },
  { value: "golestan", label: "استان گلستان" },
  { value: "gilan", label: "استان گیلان" },
  { value: "lorestan", label: "استان لرستان" },
  { value: "mazandaran", label: "استان مازندران" },
  { value: "markazi", label: "استان مرکزی" },
  { value: "hormozgan", label: "استان هرمزگان" },
  { value: "hamedan", label: "استان همدان" },
];

function ProvinceSelect({ province, setProvince, error }) {
  return (
    <div className={styles.formGroup}>
      <label className={styles.formLabel}>
        <FaLocationDot />
        استان <span className={styles.requiredStar}>*</span>
      </label>
      <Select
        options={provinces}
        value={province}
        onChange={setProvince}
        placeholder="استان خود را انتخاب کنید..."
        isClearable
        classNamePrefix="react-select"
        noOptionsMessage={() => "یافت نشد"}
        className={`${error ? styles.errorSelect : ""}`}
        styles={{
          control: (base) => ({
            ...base,
            padding: "8px 16px",
            border: "2px solid rgba(93, 117, 129, 0.2)",
            borderRadius: "10px",
            "&:hover": {
              borderColor: "#5d7581",
            },
          }),
          placeholder: (base) => ({
            ...base,
            color: "#adb5bd",
          }),
        }}
      />
      {error && (
        <small className={`${styles.errorMessage} ${error ? styles.show : ""}`}>
          {error}
        </small>
      )}
    </div>
  );
}

export default ProvinceSelect;
