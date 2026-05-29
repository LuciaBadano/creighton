import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import styles from "./Login.module.css";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMsg(null);

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
    } else {
      const { error } = await signUp(email, password, name);
      if (error) setError(error.message);
      else
        setMsg(
          "¡Solicitud enviada! Un administrador revisará tu cuenta y te dará acceso pronto.",
        );
    }
    setLoading(false);
  };

  const switchMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setError(null);
    setMsg(null);
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
        <p className={styles.sub}>
          {mode === "login"
            ? "Tu registro personal de fertilidad"
            : "Solicitá acceso a la aplicación"}
        </p>

        <form onSubmit={handle} className={styles.form}>
          {mode === "register" && (
            <div className={styles.field}>
              <label htmlFor="name">Nombre completo</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                required
              />
            </div>
          )}
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

          {!msg && (
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={loading}
            >
              {loading
                ? "Cargando..."
                : mode === "login"
                  ? "Ingresar"
                  : "Solicitar acceso"}
            </button>
          )}
        </form>

        {mode === "register" && (
          <div className={styles.infoBox}>
            <span className={styles.infoIcon}>ℹ️</span>
            Tu cuenta quedará pendiente hasta que un administrador la apruebe.
          </div>
        )}

        <p className={styles.toggle}>
          {mode === "login" ? "¿No tenés cuenta?" : "¿Ya tenés cuenta?"}{" "}
          <button onClick={switchMode}>
            {mode === "login" ? "Solicitar acceso" : "Iniciar sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}
