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

// PrivateRoute baraye fake login
function PrivateRoute({ children, roles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function Layout({ children }) {
  const location = useLocation();
  const hideNav = location.pathname === "/login";

  if (hideNav) {
    return <>{children}</>;
  }

  const getDeviceType = () => {
    const width = window.innerWidth;
    if (width < 400) return "mobile";
    if (width < 800) return "tablet";
    return "laptop";
  };

  const [deviceType, setDeviceType] = useState(getDeviceType());

  useEffect(() => {
    const handleResize = () => setDeviceType(getDeviceType());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navHeights = { mobile: 60, tablet: 70, laptop: 80 };

  return (
    <div>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: `${navHeights[deviceType]}px`,
          zIndex: 1000,
        }}
      >
        <NavBar deviceType={deviceType} />
      </div>
      <div
        style={{
          marginTop: `${navHeights[deviceType]}px`,
          height: `calc(100vh - ${navHeights[deviceType]}px)`,
        }}
      >
        {children}
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
              <PrivateRoute roles={["expert", "admin", "promoter"]}>
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
