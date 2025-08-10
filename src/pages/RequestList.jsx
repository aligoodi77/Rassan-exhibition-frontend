import React, { useEffect, useMemo, useState, useRef } from "react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import styles from "./RequestList.module.css";
import {
  FaStar,
  FaGift,
  FaBoxOpen,
  FaConciergeBell,
  FaChild,
  FaUtensils,
} from "react-icons/fa";

// تنظیمات سوکت با احراز هویت
const socket = io("http://localhost:8800", {
  transports: ["websocket"],
  reconnection: true,
  auth: {
    token: localStorage.getItem("token"),
  },
});

// تعاریف گیفت برای نمایش (label, icon, توضیح)
const GIFT_DEFS = {
  giftAPlus: {
    short: "A+",
    full: "گیفت ممتاز (A+)",
    icon: <FaStar />,
    classSuffix: "GiftAPlus",
  },
  giftA: {
    short: "A",
    full: "گیفت A",
    icon: <FaGift />,
    classSuffix: "GiftA",
  },
  giftB: {
    short: "B",
    full: "گیفت B",
    icon: <FaBoxOpen />,
    classSuffix: "GiftB",
  },
  giftService: {
    short: "سرویس",
    full: "خدمت / سرویس",
    icon: <FaConciergeBell />,
    classSuffix: "GiftService",
  },
  giftChild: {
    short: "کودک",
    full: "بسته کودک",
    icon: <FaChild />,
    classSuffix: "GiftChild",
  },
  food: {
    short: "غذا",
    full: "غذا",
    icon: <FaUtensils />,
    classSuffix: "Food",
  },
};

export default function RequestList() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const pageSize = 10;
  const isMounted = useRef(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    isMounted.current = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8800/api/forms", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Failed to fetch forms");
        }

        const data = await res.json();
        if (isMounted.current) {
          setForms(
            data.map((form) => ({
              ...form,
              id: Number(form.id),
              status: form.isConfirmed ? "confirm" : "pending",
              gifts: form.gifts || {},
            }))
          );
          setError(null);
        }
      } catch (err) {
        if (isMounted.current) {
          console.error("Fetch error:", err);
          setError(err.message);
          if (
            err.message.includes("401") ||
            err.message.includes("Unauthorized")
          ) {
            localStorage.removeItem("token");
            navigate("/login");
          }
        }
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchData();

    // سوکت هندلرها...
    const handleFormUpdate = (updatedForm) => {
      if (isMounted.current) {
        setForms((prev) =>
          prev.map((f) =>
            f.id === Number(updatedForm.id)
              ? {
                  ...updatedForm,
                  status: updatedForm.isConfirmed ? "confirm" : "pending",
                  gifts: updatedForm.gifts || {},
                }
              : f
          )
        );
      }
    };

    const handleNewForm = (newForm) => {
      console.log("📥 Received newForm:", newForm);
      if (isMounted.current) {
        setForms((prev) => [
          {
            ...newForm,
            status: newForm.isConfirmed ? "confirm" : "pending",
            gifts: newForm.gifts || {},
          },
          ...prev.filter((f) => f.id !== newForm.id),
        ]);
        console.log("✅ Updated forms state with new form");
      }
    };

    const handleDeleteForm = (id) => {
      if (isMounted.current) {
        setForms((prev) => prev.filter((f) => f.id !== Number(id)));
      }
    };

    const handleSocketError = (err) => {
      if (isMounted.current) {
        console.error("Socket error:", err);
        setError(err.message || "اتصال به سرور با مشکل مواجه شد");
      }
    };

    socket.on("connect", () => {
      console.log("Connected to WebSocket");
      if (token) {
        socket.emit("join", token);
      }
    });

    socket.on("newForm", handleNewForm);
    socket.on("updateForm", handleFormUpdate);
    socket.on("deleteForm", handleDeleteForm);
    socket.on("error", handleSocketError);

    return () => {
      isMounted.current = false;
      socket.off("newForm", handleNewForm);
      socket.off("updateForm", handleFormUpdate);
      socket.off("deleteForm", handleDeleteForm);
      socket.off("error", handleSocketError);
    };
  }, [token, navigate]);

  const computeGiftCounts = (form) => {
    const gifts = form.gifts || {};
    const counts = {};

    Object.entries(gifts).forEach(([key, value]) => {
      const num = Number(value);
      if (!isNaN(num) && num > 0) {
        counts[key] = num;
      }
    });

    return counts;
  };

  // جدید: نمایش زیباتر گیفت‌ها با آیکون و رنگ
  const renderGiftCounts = (form) => {
    const counts = computeGiftCounts(form);

    if (Object.keys(counts).length === 0) {
      return <span className={styles.noGifts}>-</span>;
    }

    return (
      <div className={styles.giftCountsHorizontal}>
        {Object.entries(counts).map(([key, value]) => {
          const def = GIFT_DEFS[key] || {
            short: key,
            full: key,
            icon: <FaGift />,
            classSuffix: key,
          };

          // نام کلاس مثل: giftGiftAPlus یا giftGiftA
          const classNameFromCss =
            styles[
              `gift${
                def.classSuffix.charAt(0).toUpperCase() +
                def.classSuffix.slice(1)
              }`
            ] || styles.giftDefault;

          return (
            <div
              key={key}
              className={`${styles.giftBox} ${styles.giftBadge} ${classNameFromCss}`}
              title={`${def.full}: ${value}`}
              aria-label={`${def.full} تعداد ${value}`}
            >
              <span className={styles.giftIconSmall} aria-hidden>
                {def.icon}
              </span>
              <span className={styles.giftLabelSmall}>{value}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // بقیهٔ فانکشن‌ها (handleDelete, handleEdit, handleConfirm, فیلتر و غیره) بدون تغییر
  const handleDelete = async (id) => {
    if (!window.confirm("آیا مطمئن هستید که می‌خواهید این فرم را حذف کنید؟")) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:8800/api/forms/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "حذف ناموفق بود");
      }

      setError(null);
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message);

      if (err.message.includes("Unauthorized")) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const handleEdit = (form) => {
    navigate("/form", {
      state: {
        editData: {
          ...form,
          lastUpdated: new Date().toISOString(),
        },
      },
    });
  };

  const handleConfirm = async (id) => {
    try {
      const res = await fetch(`http://localhost:8800/api/forms/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isConfirmed: true }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "تأیید ناموفق بود");
      }

      setError(null);
    } catch (err) {
      console.error("Confirm error:", err);
      setError(err.message);

      if (err.message.includes("Unauthorized")) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  // فیلتر و صفحه‌بندی
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return forms
      .filter((form) => {
        const statusMatch =
          filterStatus === "all" || form.status === filterStatus;
        const searchMatch =
          !q ||
          String(form.id).includes(q) ||
          form.fullName?.toLowerCase().includes(q);

        return statusMatch && searchMatch;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [forms, search, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = useMemo(() => {
    return filtered.slice((page - 1) * pageSize, page * pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  useEffect(() => {
    setPage(1);
  }, [search, filterStatus]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>لیست درخواست‌ها</h2>

      {error && (
        <div className={styles.error}>
          {error}
          <button onClick={() => setError(null)} className={styles.closeError}>
            ×
          </button>
        </div>
      )}

      <div className={styles.controls}>
        <input
          type="text"
          aria-label="جستجو بر اساس شماره فرم یا نام"
          className={styles.search}
          placeholder="جستجو بر اساس شماره فرم یا نام..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className={styles.filterRow}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.select}
            aria-label="فیلتر بر اساس وضعیت"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="confirm">تأیید شده</option>
            <option value="pending">در انتظار</option>
          </select>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>شماره</th>
              <th>نام و نام خانوادگی</th>
              <th>فعالیت</th>
              <th>کارشناس</th>
              <th>گیفت</th>
              <th>وضعیت</th>
              <th style={{ textAlign: "right" }}>عملیات</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className={styles.center}>
                  <div className={styles.loading}>در حال بارگذاری...</div>
                </td>
              </tr>
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.center}>
                  موردی یافت نشد
                </td>
              </tr>
            ) : (
              pageItems.map((form) => (
                <tr key={form.id} className={styles.row}>
                  <td className={styles.idCell}>{form.id}</td>
                  <td className={styles.nameCell}>{form.fullName || "-"}</td>
                  <td>{form.activity || "-"}</td>
                  <td>{form.createdBy?.name || "نامشخص"}</td>
                  <td className={styles.giftCell}>{renderGiftCounts(form)}</td>
                  <td>
                    <span
                      className={
                        form.status === "confirm"
                          ? styles.statusConfirmedBadge
                          : styles.statusUnconfirmedBadge
                      }
                    >
                      {form.status === "confirm"
                        ? "✓ تأیید شده"
                        : "✖ در انتظار"}
                    </span>
                  </td>
                  <td className={styles.actionsCell}>
                    <div className={styles.actions}>
                      <button
                        className={styles.btnEdit}
                        onClick={() => handleEdit(form)}
                        aria-label={`ویرایش فرم ${form.id}`}
                      >
                        ویرایش
                      </button>
                      <button
                        className={styles.btnDelete}
                        onClick={() => handleDelete(form.id)}
                        aria-label={`حذف فرم ${form.id}`}
                      >
                        حذف
                      </button>
                      {form.status !== "confirm" && (
                        <button
                          className={styles.btnConfirm}
                          onClick={() => handleConfirm(form.id)}
                          aria-label={`تأیید فرم ${form.id}`}
                        >
                          تأیید
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className={styles.pager}>
          <div className={styles.pageInfo}>
            صفحه {page} از {totalPages} • {filtered.length} نتیجه
          </div>

          <div className={styles.pageButtons}>
            <button
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="صفحه قبلی"
            >
              قبلی
            </button>

            <button
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="صفحه بعدی"
            >
              بعدی
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
