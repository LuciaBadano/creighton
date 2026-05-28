import { useAuth } from "../hooks/useAuth";
import styles from "./Pending.module.css";

export default function Pending() {
  const { user, signOut, refreshProfile } = useAuth();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>⏳</div>
        <h1 className={styles.title}>Cuenta en revisión</h1>
        <p className={styles.text}>
          Tu solicitud fue recibida. Un administrador revisará tu cuenta y te
          dará acceso.
        </p>
        <div className={styles.emailBox}>
          <span className={styles.emailLabel}>Cuenta registrada</span>
          <span className={styles.emailVal}>{user?.email}</span>
        </div>
        <p className={styles.hint}>
          Una vez aprobada, recargá esta página o hacé click en "Verificar
          estado".
        </p>
        <div className={styles.actions}>
          <button className={styles.btnRefresh} onClick={refreshProfile}>
            🔄 Verificar estado
          </button>
          <button className={styles.btnOut} onClick={signOut}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
