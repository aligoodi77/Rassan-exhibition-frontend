import React, { useEffect, useState } from "react";
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

  // State for form fields
  const [gender, setGender] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [activity, setActivity] = useState("");
  const [description, setDescription] = useState("");
  const [province, setProvince] = useState(null);
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
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState({ show: false, title: "", message: "" });

  // Get user role from localStorage
  const role = localStorage.getItem("role") || "";

  // Check token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // Fill form in edit mode
  useEffect(() => {
    if (editData) {
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
    }
  }, [editData]);

  // Form validation
  const validate = () => {
    const newErrors = {};

    if (!gender) newErrors.gender = "لطفاً جنسیت را انتخاب کنید.";
    if (!fullName.trim())
      newErrors.fullName = "لطفاً نام و نام خانوادگی را وارد کنید.";

    if (activity !== "مدیریت VIP") {
      if (!phone.trim()) newErrors.phone = "لطفاً شماره تماس را وارد کنید.";
      if (!activity) newErrors.activity = "لطفاً زمینه فعالیت را انتخاب کنید.";
      if (!province) newErrors.province = "لطفاً استان را انتخاب کنید.";
      if (!city.trim()) newErrors.city = "لطفاً شهرستان را وارد کنید.";
    }

    if (image) {
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

  // Toggle needs
  const handleCheckboxChange = (value) => {
    setNeeds((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  // Handle image change
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setErrors((prev) => ({ ...prev, image: null }));
  };

  // Submit form
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
    formData.append("phone", phone);
    formData.append("activity", activity);
    formData.append("description", description);
    formData.append("province", province ? province.value : "");
    formData.append("city", city);
    formData.append("needs", JSON.stringify(needs));
    formData.append("gifts", JSON.stringify(gifts));
    if (image) formData.append("image", image);
    if (editData) formData.append("isConfirmed", "false");

    const token = localStorage.getItem("token");

    try {
      let res;
      if (editData && editData.id) {
        res = await fetch(`http://localhost:8800/api/forms/${editData.id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      } else {
        res = await fetch("http://localhost:8800/api/forms", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      }

      const data = await res.json();
      console.log("Backend response:", data); // دیباگ پاسخ بک‌اند

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

      // Reset form or redirect
      if (!editData) {
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
        setImage(null);
      } else if (role === "admin") {
        navigate("/requests");
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error); // دیباگ خطا
      setModal({
        show: true,
        title: "خطا",
        message: error.message || "خطایی رخ داده است",
      });
    }
  };

  const closeModal = () => {
    setModal({ show: false, title: "", message: "" });
    if (editData && role === "admin") {
      navigate("/requests");
    }
  };

  useEffect(() => {
    if (activity === "مدیریت VIP") {
      setGiftVIP(true);
    } else {
      setGiftVIP(false);
      setGifts((prev) => ({ ...prev, giftAPlus: "" }));
    }
  }, [activity]);

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
            <ProvinceSelect
              province={province}
              setProvince={setProvince}
              error={errors.province}
            />
            <City city={city} setCity={setCity} error={errors.city} />
            <label className={styles.titleLabel}>
              <FaClipboardList />
              موارد مورد نیاز
            </label>
            <Needs onClick={handleCheckboxChange} needs={needs} />
          </>
        )}

        {["admin", "formOnly", "gift"].includes(role) && (
          <>
            <label className={styles.titleLabel}>
              <FaGift />
              گیفت‌ها
            </label>
            <Gifts giftVIP={giftVIP} gifts={gifts} setGifts={setGifts} />
          </>
        )}

        <label className={styles.titleLabel}>
          <FaImage />
          تصویر
        </label>
        <div className={styles.inputbox}>
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleImageChange}
            className={styles.input}
          />
          {errors.image && <p className={styles.error}>{errors.image}</p>}
        </div>

        <button type="submit" className={styles.submitButton}>
          {editData ? "بروزرسانی درخواست" : "ثبت درخواست"}
        </button>
      </form>
      {modal.show && (
        <>
          {console.log("Modal state:", modal)} {/* دیباگ وضعیت مودال */}
          <Modal {...modal} onClose={closeModal} />
        </>
      )}
    </div>
  );
}
