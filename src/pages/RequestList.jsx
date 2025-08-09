import React, { useEffect, useMemo, useState } from "react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import styles from "./RequestList.module.css";

// اتصال به WebSocket با پورت درست و جوین به adminRoom
const socket = io("http://localhost:8800");

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function RequestList() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const pageSize = 10;

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    let mounted = true;

    // جوین به adminRoom بعد از اتصال به WebSocket
    socket.on("connect", () => {
      console.log("Connected to WebSocket");
      socket.emit("join", "adminRoom");
    });

    socket.on("connect_error", (err) => {
      console.error("WebSocket connection error:", err);
      if (mounted) setError("خطا در اتصال به سرور");
    });

    setLoading(true);
    fetch("http://localhost:8800/api/forms", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
            throw new Error("لطفاً دوباره وارد شوید");
          }
          throw new Error(`Fetch failed: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        setForms(
          Array.isArray(data)
            ? data.map((form) => ({
                ...form,
                status: form.isConfirmed ? "confirm" : "pending",
              }))
            : []
        );
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error("Error fetching forms:", err);
        setForms([]);
        setError(err.message || "خطا در دریافت داده‌ها");
      })
      .finally(() => mounted && setLoading(false));

    socket.on("newForm", (newForm) => {
      const nf = {
        ...newForm,
        gifts: newForm.gifts || {},
        status: newForm.isConfirmed ? "confirm" : "pending",
      };
      setForms((prev) => {
        if (prev.some((f) => f.id === nf.id)) return prev;
        return [nf, ...prev];
      });
    });

    socket.on("deleteForm", (id) => {
      setForms((prev) => prev.filter((f) => f.id !== id));
    });

    socket.on("updateForm", (updated) => {
      setForms((prev) =>
        prev.map((f) =>
          f.id === updated.id
            ? { ...updated, status: updated.isConfirmed ? "confirm" : "pending" }
            : f
        )
      );
    });

    return () => {
      mounted = false;
      socket.off("newForm");
      socket.off("deleteForm");
      socket.off("updateForm");
      socket.off("connect");
      socket.off("connect_error");
    };
  }, [token, navigate]);

  const computeGiftCounts = (form) => {
    const gifts = form.gifts || {};
    const counts = {};
    Object.keys(gifts).forEach((key) => {
      counts[key] = parseInt(gifts[key]) || 0;
    });
    const total = Object.values(counts).reduce((sum, val) => sum + val, 0);
    return { ...counts, total };
  };

  const renderGiftCounts = (form) => {
    const c = computeGiftCounts(form);
    return (
      <div className={styles.giftCountsHorizontal}>
        {Object.keys(c).map((key) => {
          if (key === "total" || c[key] === 0) return null;
          return (
            <div
              key={key}
              className={`${styles.giftBox} ${
                styles[`gift${key}`] || styles.giftDefault
              }`}
              title={`${key}: ${c[key]}`}
            >
              {c[key]}
            </div>
          );
        })}
      </div>
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("آیا مطمئن هستید؟")) return;
    try {
      const res = await fetch(`http://localhost:8800/api/forms/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setForms((prev) => prev.filter((f) => f.id !== id));
        setError(null);
      } else {
        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          setError("لطفاً دوباره وارد شوید");
        } else {
          setError("حذف ناموفق بود");
        }
      }
    } catch (err) {
      console.error("Error deleting form:", err);
      setError("خطای شبکه");
    }
  };

  const handleEdit = (form) => {
    const updatedForm = { ...form, lastUpdated: new Date().toISOString() };
    navigate("/form", { state: { editData: updatedForm } });
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
      if (res.ok) {
        const updated = await res.json();
        setForms((prev) =>
          prev.map((f) =>
            f.id === id
              ? { ...updated, status: updated.isConfirmed ? "confirm" : "pending" }
              : f
          )
        );
        setError(null);
      } else {
        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          setError("لطفاً دوباره وارد شوید");
        } else {
          setError("تأیید ناموفق بود");
        }
      }
    } catch (err) {
      console.error("Error confirming form:", err);
      setError("خطای شبکه");
    }
  };

  const highlightMatches = (text = "", q = "") => {
    if (!q) return text;
    try {
      const escaped = escapeRegExp(q);
      const regex = new RegExp(escaped, "gi");
      const parts = [];
      let lastIndex = 0;
      let match;
      while ((match = regex.exec(text)) !== null) {
        const idx = match.index;
        if (idx > lastIndex) parts.push(text.slice(lastIndex, idx));
        parts.push(
          <span key={idx + Math.random()} className={styles.highlight}>
            {text.slice(idx, idx + match[0].length)}
          </span>
        );
        lastIndex = idx + match[0].length;
      }
      if (lastIndex < text.length) parts.push(text.slice(lastIndex));
      return parts;
    } catch {
      return text;
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return forms
      .filter((f) => {
        if (filterStatus !== "all" && (f.status || "") !== filterStatus)
          return false;
        if (!q) return true;
        const fields = [
          f.fullName || "",
          f.phone || "",
          f.activity || "",
          (f.createdBy && f.createdBy.name) || "",
        ]
          .join(" ")
          .toLowerCase();
        return fields.includes(q);
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [forms, search, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  useEffect(() => setPage(1), [search, filterStatus]);

  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>لیست درخواست‌ها</h2>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.controls}>
        <input
          aria-label="search"
          className={styles.search}
          placeholder="جستجو بر اساس نام، تلفن، فعالیت..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={styles.filterRow}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.select}
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="confirm">تأیید شده</option>
            <option value="pending">در انتظار</option>
            {/* گزینه rejected حذف شده چون بک‌اند پشتیبانی نمی‌کنه */}
          </select>
        </div>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
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
                  در حال بارگذاری...
                </td>
              </tr>
            ) : pageItems.length ? (
              pageItems.map((form) => (
                <tr key={form.id} className={styles.row}>
                  <td className={styles.idCell}>
                    <span className={styles.idPrefix}>
                      {String(form.id || "").slice(0, 2)}
                    </span>
                  </td>
                  <td className={styles.nameCell}>
                    {highlightMatches(form.fullName || "", search)}
                  </td>
                  <td>{form.activity || "-"}</td>
                  <td>{form.createdBy?.name || "نامشخص"}</td>
                  <td className={styles.giftCell}>{renderGiftCounts(form)}</td>
                  <td>
                    {form.status === "confirm" ? (
                      <span className={styles.statusConfirmedBadge}>
                        ✓ تأیید شده
                      </span>
                    ) : (
                      <span className={styles.statusUnconfirmedBadge}>
                        ✖ در انتظار
                      </span>
                    )}
                  </td>
                  <td className={styles.actionsCell}>
                    <div className={styles.actions}>
                      <button
                        className={styles.btnEdit}
                        onClick={() => handleEdit(form)}
                      >
                        ویرایش
                      </button>
                      <button
                        className={styles.btnDelete}
                        onClick={() => handleDelete(form.id)}
                      >
                        حذف
                      </button>
                      {form.status !== "confirm" && (
                        <button
                          className={styles.btnConfirm}
                          onClick={() => handleConfirm(form.id)}
                        >
                          تأیید
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className={styles.center}>
                  موردی یافت نشد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className={styles.pager}>
        <div className={styles.pageInfo}>
          صفحه {page} از {totalPages} • {filtered.length} نتیجه
        </div>
        <div className={styles.pageButtons}>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            قبلی
          </button>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            بعدی
          </button>
        </div>
      </div>
    </div>
  );
}