import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Main from "./pages/Main";
import Pending from "./pages/Pending";
import AdminPanel from "./pages/AdminPanel";
import { ROUTER } from "./constants/router";

const Loader = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        color: "var(--text3)",
        fontFamily: "DM Serif Display, serif",
        fontStyle: "italic",
        fontSize: 22,
      }}
    >
      Cargando…
    </div>
  );
};

const AppRoutes = () => {
  const { user, loading, isAdmin, isPending, isApproved } = useAuth();
  const [showAdmin, setShowAdmin] = useState(false);

  console.log("Auth state:", { user, loading, isAdmin, isPending, isApproved });

  const isAutenticated = !!user;

  if (loading) return <Loader />;

  // No autenticado → login
  if (!isAutenticated) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // Autenticado pero pendiente de aprobación
  if (isAutenticated && isPending) return <Pending />;

  // Admin viendo panel de admin
  if (isAdmin && showAdmin) {
    return <AdminPanel onExit={() => setShowAdmin(false)} />;
  }

  // Usuario aprobado (o admin en su vista normal)
  if (isApproved) {
    return (
      <Routes>
        <Route
          path="*"
          element={
            <Main isAdmin={isAdmin} onOpenAdmin={() => setShowAdmin(true)} />
          }
        />
      </Routes>
    );
  }

  // Fallback
  return <Login />;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
