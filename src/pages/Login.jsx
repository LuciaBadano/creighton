import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import styles from "./Login.module.css";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMsg(null);
    const fn = mode === "login" ? signIn : signUp;
    const { error } = await fn(email, password);
    if (error) setError(error.message);
    else if (mode === "register")
      setMsg("¡Cuenta creada! Revisá tu email para confirmar.");
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoCircle}>C</span>
        </div>
        <h1 className={styles.title}>
          Ciclo <em>Creighton</em>
        </h1>
        <p className={styles.sub}>Tu registro personal de fertilidad</p>

        <form onSubmit={handle} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="pass">Contraseña</label>
            <input
              id="pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          {msg && <p className={styles.success}>{msg}</p>}
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={loading}
          >
            {loading
              ? "Cargando..."
              : mode === "login"
                ? "Ingresar"
                : "Crear cuenta"}
          </button>
        </form>

        <p className={styles.toggle}>
          {mode === "login" ? "¿No tenés cuenta?" : "¿Ya tenés cuenta?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError(null);
              setMsg(null);
            }}
          >
            {mode === "login" ? "Registrarse" : "Iniciar sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}
