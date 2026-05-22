import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Calendar from "./pages/Calendar";
import { ROUTER } from "./constants/router";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading)
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
  return user ? children : <Navigate to={ROUTER.LOGIN} replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to={ROUTER.CALENDAR} replace />;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path={ROUTER.LOGIN}
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
