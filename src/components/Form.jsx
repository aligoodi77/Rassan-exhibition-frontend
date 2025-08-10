// Form.jsx
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Form.module.css";
import Modal from "./Modal";
import ProvinceSelect from "./Province";
import Gifts from "./Gifts";
import Needs from "./Needs";
import City from "./City";
import Description from "./Description";
import Activity from "./Activity";
import Phone from "./Phone";
import FullName from "./FullName";
import Gender from "./Gender";
import "typeface-iransans";
import { FaUser, FaClipboardList, FaGift, FaImage } from "react-icons/fa";

export default function Form() {
  const location = useLocation();
  const navigate = useNavigate();
  const editData = location.state?.editData || null;

  // states
  const [gender, setGender] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [activity, setActivity] = useState("");
  const [description, setDescription] = useState("");
  const [province, setProvince] = useState(null); // {label,value} or null
  const [city, setCity] = useState("");
  const [needs, setNeeds] = useState([]);
  const [giftVIP, setGiftVIP] = useState(false);
  const [gifts, setGifts] = useState({
    giftAPlus: "",
    giftA: "",
    giftB: "",
    giftService: "",
    giftChild: "",
    food: "",
  });

  // image related
  const [image, setImage] = useState(null); // File object (new upload)
  const [previewUrl, setPreviewUrl] = useState(null); // local preview for new file
  const [existingImageUrl, setExistingImageUrl] = useState(null); // server image (only shown for صادرات)
  const previewRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState({ show: false, title: "", message: "" });

  const role = localStorage.getItem("role") || "";
  const tokenStored = localStorage.getItem("token");
  const API_BASE = import.meta?.env?.VITE_API_URL || "http://localhost:8800";

  // redirect to login if no token
  useEffect(() => {
    if (!tokenStored) navigate("/login");
  }, [navigate, tokenStored]);

  // fill edit data
  useEffect(() => {
    if (!editData) return;

    setGender(editData.gender || "");
    setFullName(editData.fullName || "");
    setPhone(editData.phone || "");
    setActivity(editData.activity || "");
    setDescription(editData.description || "");
    setProvince(
      editData.province
        ? typeof editData.province === "string"
          ? { label: editData.province, value: editData.province }
          : editData.province
        : null
    );
    setCity(editData.city || "");
    setNeeds(Array.isArray(editData.needs) ? editData.needs : []);
    setGifts(
      editData.gifts || {
        giftAPlus: "",
        giftA: "",
        giftB: "",
        giftService: "",
        giftChild: "",
        food: "",
      }
    );

    // only show existing server image if editData.image exists AND activity is صادرات
    if (editData.image && editData.activity === "صادرات") {
      setExistingImageUrl(`${API_BASE}/uploads/${editData.image}`);
    } else {
      setExistingImageUrl(null);
    }

    // clear preview/new selection initially
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setImage(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData]);

  // when activity changes, handle صادرات behavior and existing image visibility
  useEffect(() => {
    if (activity === "مدیریت VIP") {
      setGiftVIP(true);
    } else {
      setGiftVIP(false);
      setGifts((prev) => ({ ...prev, giftAPlus: "" }));
    }

    if (activity === "صادرات") {
      // hide city (user shouldn't enter city), clear city state
      setCity("");
      // if editData had an image, show it (if present)
      if (editData && editData.image) {
        setExistingImageUrl(`${API_BASE}/uploads/${editData.image}`);
      }
    } else {
      // leaving صادرات: hide any existing preview or existingImageUrl
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setImage(null);
      setExistingImageUrl(null);
      // keep province selection as-is (user will pick province normally)
    }
    // clear related errors
    setErrors((prev) => ({ ...prev, province: null, city: null }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity]);

  // cleanup preview on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const convertPersianToEnglishDigits = (input) => {
    if (typeof input !== "string") return input;
    const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    const englishDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    let result = input;
    persianDigits.forEach((digit, index) => {
      result = result.replace(new RegExp(digit, "g"), englishDigits[index]);
    });
    return result;
  };

  // validation
  const validate = () => {
    const newErrors = {};
    if (!gender) newErrors.gender = "لطفاً جنسیت را انتخاب کنید.";
    if (!fullName.trim())
      newErrors.fullName = "لطفاً نام و نام خانوادگی را وارد کنید.";

    if (activity !== "مدیریت VIP") {
      if (!phone.trim()) newErrors.phone = "لطفاً شماره تماس را وارد کنید.";
      if (!activity) newErrors.activity = "لطفاً زمینه فعالیت را انتخاب کنید.";

      if (activity === "صادرات") {
        // require country (province.value)
        if (!province || !province.value || !String(province.value).trim()) {
          newErrors.province = "لطفاً کشور را وارد کنید.";
        }
        // city not required
      } else {
        if (!province) newErrors.province = "لطفاً استان را انتخاب کنید.";
        if (!city.trim()) newErrors.city = "لطفاً شهرستان را وارد کنید.";
      }
    }

    // image validation: only validate if activity === "صادرات" and a new file was selected
    if (activity === "صادرات" && image) {
      if (image.size > 10 * 1024 * 1024) {
        newErrors.image = "حجم تصویر باید کمتر از 10 مگابایت باشد.";
      }
      if (!["image/jpeg", "image/png"].includes(image.type)) {
        newErrors.image = "فقط تصاویر JPEG و PNG مجاز هستند.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // checkbox for needs
  const handleCheckboxChange = (value) => {
    setNeeds((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
    );
  };

  // handle image selection (only triggered when input visible i.e. activity === 'صادرات')
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // revoke previous preview URL if any
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setImage(file);
    const obj = URL.createObjectURL(file);
    setPreviewUrl(obj);
    previewRef.current = obj;

    // hide existing server image display (we keep it on server, but UI shows preview)
    setExistingImageUrl(null);

    setErrors((prev) => ({ ...prev, image: null }));
  };

  const cancelNewImage = () => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
    setPreviewUrl(null);
    setImage(null);
    // if editing and editData has server image and activity is صادرات, show it back
    if (editData && editData.image && activity === "صادرات") {
      setExistingImageUrl(`${API_BASE}/uploads/${editData.image}`);
    }
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (editData && role !== "admin") {
      setModal({
        show: true,
        title: "خطا",
        message: "شما اجازه ویرایش اطلاعات را ندارید.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("gender", gender);
    formData.append("fullName", fullName);
    formData.append("phone", convertPersianToEnglishDigits(phone || ""));
    formData.append("activity", activity);
    formData.append("description", description || "");

    // province: if صادرات => province holds country string in {label,value}
    formData.append("province", province ? province.value : "");
    // city might be empty string (for صادرات)
    formData.append("city", city || "");

    formData.append("needs", JSON.stringify(needs || []));
    formData.append(
      "gifts",
      JSON.stringify(
        Object.fromEntries(
          Object.entries(gifts || {}).map(([k, v]) => [
            k,
            convertPersianToEnglishDigits(v || ""),
          ])
        )
      )
    );

    // Only append image if user chose a new file (optional). If not appended, server keeps existing filename.
    if (activity === "صادرات" && image) {
      formData.append("image", image);
    }

    if (editData) {
      formData.append("isConfirmed", "false");
    }

    const token = localStorage.getItem("token");
    try {
      let res;
      if (editData && editData.id) {
        res = await fetch(`${API_BASE}/api/forms/${editData.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } else {
        res = await fetch(`${API_BASE}/api/forms`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      }

      const data = await res.json();
      console.log("Backend response:", data);

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/login");
          throw new Error("لطفاً دوباره وارد شوید.");
        }
        throw new Error(data.message || "خطا در ارسال اطلاعات");
      }

      setModal({
        show: true,
        title: "موفقیت",
        message: editData
          ? "درخواست شما با موفقیت اصلاح شد"
          : "اطلاعات با موفقیت ثبت شد",
      });

      if (!editData) {
        // reset
        setGender("");
        setFullName("");
        setPhone("");
        setActivity("");
        setDescription("");
        setProvince(null);
        setCity("");
        setNeeds([]);
        setGifts({
          giftAPlus: "",
          giftA: "",
          giftB: "",
          giftService: "",
          giftChild: "",
          food: "",
        });
        if (previewRef.current) {
          URL.revokeObjectURL(previewRef.current);
          previewRef.current = null;
        }
        setPreviewUrl(null);
        setImage(null);
        setExistingImageUrl(null);
      } else if (role === "admin") {
        navigate("/requests");
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setModal({
        show: true,
        title: "خطا",
        message: err.message || "خطایی رخ داده است",
      });
    }
  };

  const closeModal = () => {
    setModal({ show: false, title: "", message: "" });
    if (editData && role === "admin") navigate("/requests");
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.titleLabel}>
          <FaUser />
          اطلاعات شخصی
        </label>

        <Gender gender={gender} setGender={setGender} error={errors.gender} />

        <FullName
          fullName={fullName}
          setFullName={setFullName}
          error={errors.fullName}
          activity={activity}
        />

        <Activity
          activity={activity}
          setActivity={setActivity}
          error={errors.activity}
        />

        {activity !== "مدیریت VIP" && (
          <>
            <Phone phone={phone} setPhone={setPhone} error={errors.phone} />
            <Description
              description={description}
              setDescription={setDescription}
            />

            {activity === "صادرات" ? (
              <>
                {/* country text input (stored in province.value) */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    کشور <span className={styles.requiredStar}>*</span>
                  </label>
                  <input
                    className={`${styles.input} ${
                      errors.province ? styles.error : ""
                    }`}
                    type="text"
                    value={province ? province.value : ""}
                    onChange={(e) =>
                      setProvince(
                        e.target.value
                          ? { label: e.target.value, value: e.target.value }
                          : null
                      )
                    }
                    placeholder="نام کشور را وارد کنید..."
                  />
                  {errors.province && (
                    <small className={`${styles.errorMessage} ${styles.show}`}>
                      {errors.province}
                    </small>
                  )}
                </div>

                {/* show preview / existing image + file input (optional upload) */}
                <label className={styles.titleLabel}>
                  <FaImage />
                  تصویر (اختیاری برای صادرات)
                </label>

                <div className={styles.inputbox}>
                  {previewUrl ? (
                    <div className={styles.imagePreview}>
                      <img src={previewUrl} alt="پیش‌نمایش تصویر جدید" />
                      <div className={styles.previewActions}>
                        <button
                          type="button"
                          className={styles.clearBtn}
                          onClick={cancelNewImage}
                        >
                          لغو تصویر جدید
                        </button>
                        <small>
                          تصویر جدید در صورت ارسال جایگزین خواهد شد.
                        </small>
                      </div>
                    </div>
                  ) : existingImageUrl ? (
                    <div className={styles.imagePreview}>
                      <img src={existingImageUrl} alt="تصویر فعلی" />
                      <div className={styles.previewActions}>
                        <small>
                          تصویر آپلود شده قبلی. در صورت انتخاب تصویر جدید، تصویر
                          جدید ذخیره خواهد شد.
                        </small>
                      </div>
                    </div>
                  ) : null}

                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleImageChange}
                    className={styles.input}
                  />
                  {errors.image && (
                    <p className={styles.error}>{errors.image}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <ProvinceSelect
                  province={province}
                  setProvince={setProvince}
                  error={errors.province}
                />
                <City city={city} setCity={setCity} error={errors.city} />
              </>
            )}

            <label className={styles.titleLabel}>
              <FaClipboardList />
              موارد مورد نیاز
            </label>
            <Needs onClick={handleCheckboxChange} needs={needs} />
          </>
        )}

        {["admin", "expert", "promoter"].includes(role) && (
          <>
            <label className={styles.titleLabel}>
              <FaGift />
              گیفت‌ها
            </label>
            <Gifts giftVIP={giftVIP} gifts={gifts} setGifts={setGifts} />
          </>
        )}

        {/* submit */}
        <button type="submit" className={styles.submitButton}>
          {editData ? "بروزرسانی درخواست" : "ثبت درخواست"}
        </button>
      </form>

      {modal.show && (
        <>
          {console.log("Modal state:", modal)}
          <Modal {...modal} onClose={closeModal} />
        </>
      )}
    </div>
  );
}
