import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { DAY_TYPES, COLOR_MAP } from "../lib/codes";
import styles from "./AdminPanel.module.css";

const MONTHS_ES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];
const MONTHS_LONG = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// ─── Hook: carga todos los perfiles ─────────────────────────
const useProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setProfiles(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const approve = async (id) => {
    const { error } = await supabase
      .from("user_profiles")
      .update({ role: "user", approved_at: new Date().toISOString() })
      .eq("id", id);
    if (!error) fetch();
    return { error };
  };

  const reject = async (id) => {
    const { error } = await supabase
      .from("user_profiles")
      .update({ role: "pending" })
      .eq("id", id);
    if (!error) fetch();
    return { error };
  };

  const makeAdmin = async (id) => {
    const { error } = await supabase
      .from("user_profiles")
      .update({ role: "admin", approved_at: new Date().toISOString() })
      .eq("id", id);
    if (!error) fetch();
    return { error };
  };

  return { profiles, loading, approve, reject, makeAdmin, refresh: fetch };
};

// ─── Hook: carga entradas de un usuario específico ──────────
const useUserEntries = (userId, year, month) => {
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const from = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const to = `${year}-${String(month + 1).padStart(2, "0")}-31`;
    supabase
      .from("entries")
      .select("*")
      .eq("user_id", userId)
      .gte("date", from)
      .lte("date", to)
      .then(({ data }) => {
        const map = {};
        (data || []).forEach((e) => {
          map[e.date] = e;
        });
        setEntries(map);
        setLoading(false);
      });
  }, [userId, year, month]);

  return { entries, loading };
};

// ─── Mini calendario de solo lectura ────────────────────────
const ReadOnlyCalendar = ({ userId }) => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const { entries, loading } = useUserEntries(userId, year, month);

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  // Stats del mes
  const entriesArr = Object.values(entries);
  const stats = DAY_TYPES.map((t) => ({
    ...t,
    count: entriesArr.filter((e) => e.day_type === t.value).length,
  })).filter((t) => t.count > 0);

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({
      d,
      key,
      entry: entries[key] || null,
      isToday: key === todayKey,
    });
  }

  return (
    <div className={styles.miniCal}>
      <div className={styles.miniCalHeader}>
        <button className={styles.miniNavBtn} onClick={prevMonth}>
          ←
        </button>
        <span className={styles.miniMonthTitle}>
          {MONTHS_LONG[month]} {year}
        </span>
        <button className={styles.miniNavBtn} onClick={nextMonth}>
          →
        </button>
      </div>

      {loading && <div className={styles.miniLoading} />}

      <div className={styles.miniDowRow}>
        {["D", "L", "M", "X", "J", "V", "S"].map((d) => (
          <div key={d} className={styles.miniDow}>
            {d}
          </div>
        ))}
      </div>

      <div className={styles.miniGrid}>
        {cells.map((cell, i) => {
          if (!cell) return <div key={`e-${i}`} />;
          const { d, key, entry, isToday } = cell;
          const dt = entry
            ? DAY_TYPES.find((t) => t.value === entry.day_type)
            : null;
          const c = dt ? COLOR_MAP[dt.colorKey] : null;
          return (
            <div
              key={key}
              className={`${styles.miniCell} ${isToday ? styles.miniToday : ""}`}
              style={
                c
                  ? { background: c.bg, borderColor: c.border, color: c.fg }
                  : {}
              }
              title={
                dt
                  ? `${d} - ${dt.label}${entry.sensation_code ? " · " + entry.sensation_code : ""}${entry.note ? "\n" + entry.note : ""}`
                  : `Día ${d} sin registro`
              }
            >
              <span className={styles.miniDay}>{d}</span>
              {dt && <span className={styles.miniLetter}>{dt.letter}</span>}
              {entry?.is_peak && <span className={styles.miniPeak}>P</span>}
            </div>
          );
        })}
      </div>

      {/* Stats del mes */}
      {stats.length > 0 && (
        <div className={styles.miniStats}>
          {stats.map((t) => (
            <span
              key={t.value}
              className={styles.miniStat}
              style={{
                background: COLOR_MAP[t.colorKey].bg,
                color: COLOR_MAP[t.colorKey].fg,
                borderColor: COLOR_MAP[t.colorKey].border,
              }}
            >
              {t.letter} {t.count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Tarjeta de usuario ──────────────────────────────────────
const UserCard = ({ profile, onApprove, onReject, onMakeAdmin }) => {
  const [expanded, setExpanded] = useState(false);
  const [acting, setActing] = useState(false);
  const [toast, setToast] = useState(null);

  const act = async (fn, msg) => {
    setActing(true);
    const { error } = await fn(profile.id);
    setActing(false);
    if (!error) {
      setToast(msg);
      setTimeout(() => setToast(null), 2500);
    }
  };

  const roleColor =
    {
      pending: "var(--c-amarillo)",
      user: "var(--c-seco)",
      admin: "var(--c-cuspide)",
    }[profile.role] || "var(--text3)";
  const roleBg =
    {
      pending: "var(--bg-amarillo)",
      user: "var(--bg-seco)",
      admin: "var(--bg-cuspide)",
    }[profile.role] || "var(--surface2)";
  const roleLabel =
    { pending: "Pendiente", user: "Aprobada", admin: "Admin" }[profile.role] ||
    profile.role;

  const since = new Date(profile.created_at).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className={`${styles.userCard} ${profile.role === "pending" ? styles.cardPending : ""}`}
    >
      <div
        className={styles.userCardHeader}
        onClick={() => setExpanded((e) => !e)}
      >
        <div className={styles.userAvatar}>
          {(profile.full_name || profile.email).charAt(0).toUpperCase()}
        </div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>{profile.full_name || "—"}</div>
          <div className={styles.userEmail}>{profile.email}</div>
          <div className={styles.userMeta}>Registrada: {since}</div>
        </div>
        <div className={styles.userRight}>
          <span
            className={styles.roleBadge}
            style={{
              background: roleBg,
              color: roleColor,
              borderColor: roleColor,
            }}
          >
            {roleLabel}
          </span>
          <span className={styles.expandIcon}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Acciones rápidas para pendientes */}
      {profile.role === "pending" && (
        <div className={styles.quickActions}>
          <button
            className={styles.btnApprove}
            disabled={acting}
            onClick={() => act(onApprove, "Usuario aprobado ✓")}
          >
            ✓ Aprobar acceso
          </button>
          <button
            className={styles.btnMakeAdmin}
            disabled={acting}
            onClick={() => act(onMakeAdmin, "Rol admin asignado ✓")}
          >
            ⭐ Hacer admin
          </button>
        </div>
      )}

      {profile.role === "user" && (
        <div className={styles.quickActions}>
          <button
            className={styles.btnRevoke}
            disabled={acting}
            onClick={() => act(onReject, "Acceso revocado")}
          >
            ✕ Revocar acceso
          </button>
          <button
            className={styles.btnMakeAdmin}
            disabled={acting}
            onClick={() => act(onMakeAdmin, "Rol admin asignado ✓")}
          >
            ⭐ Hacer admin
          </button>
        </div>
      )}

      {toast && <div className={styles.cardToast}>{toast}</div>}

      {/* Calendario expandido */}
      {expanded && profile.role !== "pending" && (
        <div className={styles.userCalWrap}>
          <div className={styles.userCalTitle}>Registros del ciclo</div>
          <ReadOnlyCalendar userId={profile.id} />
        </div>
      )}
      {expanded && profile.role === "pending" && (
        <div className={styles.userCalWrap}>
          <p className={styles.noCalMsg}>
            Esta cuenta aún no fue aprobada. No hay registros para mostrar.
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Panel principal ─────────────────────────────────────────
const AdminPanel = ({ onExit }) => {
  const { user, signOut } = useAuth();
  const { profiles, loading, approve, reject, makeAdmin } = useProfiles();
  const [tab, setTab] = useState("pending"); // 'pending' | 'all'

  const pending = profiles.filter((p) => p.role === "pending");
  const approved = profiles.filter((p) => p.role !== "pending");
  const shown = tab === "pending" ? pending : profiles;

  return (
    <div className={styles.page}>
      {/* SIDEBAR ADMIN */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.logoCircle}>C</span>
          <div>
            <div className={styles.appName}>
              Ciclo <em>Creighton</em>
            </div>
            <div className={styles.appSub}>Panel admin</div>
          </div>
        </div>

        <div className={styles.sideSection}>
          <div className={styles.sideLabel}>Vistas</div>
          <button
            className={`${styles.sideBtn} ${tab === "pending" ? styles.sideBtnActive : ""}`}
            onClick={() => setTab("pending")}
          >
            ⏳ Pendientes
            {pending.length > 0 && (
              <span className={styles.badge}>{pending.length}</span>
            )}
          </button>
          <button
            className={`${styles.sideBtn} ${tab === "all" ? styles.sideBtnActive : ""}`}
            onClick={() => setTab("all")}
          >
            👥 Todos los usuarios
            <span className={styles.badgeGray}>{profiles.length}</span>
          </button>
        </div>

        <div className={styles.sideSection} style={{ marginTop: "auto" }}>
          <button className={styles.sideBtn} onClick={onExit}>
            ← Volver a mi ciclo
          </button>
          <button
            className={styles.sideBtn}
            onClick={signOut}
            style={{ color: "var(--c-sangrado)" }}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className={styles.main}>
        {/* Header móvil */}
        <div className={styles.mobileHeader}>
          <button className={styles.mobileBack} onClick={onExit}>
            ← Mi ciclo
          </button>
          <div className={styles.mobileTabs}>
            <button
              className={`${styles.mobileTab} ${tab === "pending" ? styles.mobileTabActive : ""}`}
              onClick={() => setTab("pending")}
            >
              Pendientes{" "}
              {pending.length > 0 && (
                <span className={styles.badge}>{pending.length}</span>
              )}
            </button>
            <button
              className={`${styles.mobileTab} ${tab === "all" ? styles.mobileTabActive : ""}`}
              onClick={() => setTab("all")}
            >
              Todos
            </button>
          </div>
        </div>

        <div className={styles.mainHeader}>
          <h1 className={styles.mainTitle}>
            {tab === "pending" ? (
              <>
                Solicitudes <em>pendientes</em>
              </>
            ) : (
              <>
                Todos los <em>usuarios</em>
              </>
            )}
          </h1>
          <span className={styles.count}>
            {shown.length} {shown.length === 1 ? "usuario" : "usuarios"}
          </span>
        </div>

        {loading && <div className={styles.loadingBar} />}

        {!loading && shown.length === 0 && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              {tab === "pending" ? "✅" : "👥"}
            </div>
            <p>
              {tab === "pending"
                ? "No hay solicitudes pendientes."
                : "No hay usuarios registrados."}
            </p>
          </div>
        )}

        <div className={styles.userList}>
          {shown.map((p) => (
            <UserCard
              key={p.id}
              profile={p}
              onApprove={approve}
              onReject={reject}
              onMakeAdmin={makeAdmin}
            />
          ))}
        </div>
      </main>
    </div>
  );
};
export default AdminPanel;
