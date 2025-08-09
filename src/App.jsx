import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import NavBar from "./components/NavBar";
import RequestList from "./pages/RequestList";
import Form from "./components/Form";
import Login from "./pages/Login";
import "typeface-iransans";

function PrivateRoute({ children, roles }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const payload = JSON.parse(atob(base64));

  if (roles && !roles.includes(payload.role))
    return <Navigate to="/login" replace />;

  return children;
}

function Layout({ children }) {
  const location = useLocation();
  const hideNav = location.pathname === "/login";
  const [deviceType, setDeviceType] = useState(getDeviceType());

  function getDeviceType() {
    const width = window.innerWidth;
    if (width < 400) return "mobile";
    if (width < 800) return "tablet";
    return "laptop";
  }

  useEffect(() => {
    const handleResize = () => {
      setDeviceType(getDeviceType());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navStyle = {
    mobile: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "60px",
      zIndex: 1000,
    },
    tablet: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "70px",
      zIndex: 1000,
    },
    laptop: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "80px",
      zIndex: 1000,
    },
  };

  const contentStyle = {
    mobile: {
      marginTop: "60px",
      padding: "0", // حذف padding
      height: "calc(100vh - 60px)", // تغییر به height
      display: "flex",
      justifyContent: "center",
      alignItems: "stretch", // تغییر به stretch
      width: "100%",
      boxSizing: "border-box",
    },
    tablet: {
      marginTop: "70px",
      padding: "0", // حذف padding
      height: "calc(100vh - 70px)", // تغییر به height
      display: "flex",
      justifyContent: "center",
      alignItems: "stretch", // تغییر به stretch
      width: "100%",
      boxSizing: "border-box",
    },
    laptop: {
      marginTop: "80px",
      padding: "0", // حذف padding
      height: "calc(100vh - 80px)", // تغییر به height
      display: "flex",
      justifyContent: "center",
      alignItems: "stretch", // تغییر به stretch
      width: "100%",
      boxSizing: "border-box",
    },
  };

  return (
    <div>
      {!hideNav && (
        <div style={{ ...navStyle[deviceType] }}>
          <NavBar deviceType={deviceType} />
        </div>
      )}
      <div style={contentStyle[deviceType]}>
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch", // تغییر به stretch
            justifyContent: "stretch", // تغییر به stretch
            height: "100%", // ارتفاع کامل
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/form"
            element={
              <PrivateRoute roles={["formOnly", "admin", "gift"]}>
                <Form />
              </PrivateRoute>
            }
          />
          <Route
            path="/requests"
            element={
              <PrivateRoute roles={["admin"]}>
                <RequestList />
              </PrivateRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}
