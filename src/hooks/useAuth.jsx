import React from "react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext({});

const PROFILE_CACHE_KEY = "creighton_profile";

const getCachedUser = () => {
  try {
    const key = Object.keys(localStorage).find(
      (k) => k.startsWith("sb-") && k.endsWith("-auth-token"),
    );
    if (!key) return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.user && parsed?.expires_at) {
      const expiresAt = parsed.expires_at * 1000;
      if (Date.now() < expiresAt) return parsed.user;
    }
    return null;
  } catch {
    return null;
  }
};

const getCachedProfile = () => {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setCachedProfile = (profile) => {
  try {
    if (profile)
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
    else localStorage.removeItem(PROFILE_CACHE_KEY);
  } catch {}
};

export function AuthProvider({ children }) {
  const cachedUser = getCachedUser();
  const cachedProfile = cachedUser ? getCachedProfile() : null;

  const [user, setUser] = useState(cachedUser);
  const [profile, setProfile] = useState(cachedProfile);
  const [loading, setLoading] = useState(!cachedUser);

  const fetchProfile = useCallback(async (uid) => {
    if (!uid) {
      setProfile(null);
      setCachedProfile(null);
      return;
    }

    try {
      const query = supabase
        .from("user_profiles")
        .select("*")
        .eq("id", uid)
        .maybeSingle();

      const result = await Promise.race([
        query,
        new Promise((resolve) =>
          setTimeout(() => resolve({ timeout: true }), 10000),
        ),
      ]);

      if (result?.timeout) {
        console.warn("fetchProfile timeout: la consulta no respondió en 10s");
        setProfile(null);
        return;
      }

      const { data, error } = result;

      if (error) {
        console.warn("fetchProfile error:", error);
        setProfile(null);
        return;
      }

      if (!data) {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          const { error: upsertError } = await supabase
            .from("user_profiles")
            .upsert({ id: uid, email: authUser.email, role: "pending" });
          if (upsertError) {
            console.warn("fetchProfile upsert error:", upsertError);
            setProfile(null);
            return;
          }
          const p = { id: uid, email: authUser.email, role: "pending" };
          setProfile(p);
          setCachedProfile(p);
        }
        return;
      }

      setProfile(data);
      setCachedProfile(data);
    } catch (e) {
      console.warn("fetchProfile exception:", e);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Si había usuario cacheado, cargamos su perfil en background
    if (cachedUser) {
      fetchProfile(cachedUser.id);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      const u = session?.user ?? null;
      setUser(u);
      if (event === "SIGNED_OUT") {
        setProfile(null);
        setCachedProfile(null);
        setLoading(false);
      } else {
        await fetchProfile(u?.id);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email, password) => {
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (!result.error && result.data.user) {
      await fetchProfile(result.data.user.id);
    }
    return result;
  };

  const signUp = async (email, password, fullName) => {
    try {
      const result = await supabase.auth.signUp({ email, password });
      if (!result.error && result.data.user) {
        if (fullName) {
          await supabase
            .from("user_profiles")
            .update({ full_name: fullName })
            .eq("id", result.data.user.id);
        }
        await fetchProfile(result.data.user.id);
      }
      return result;
    } catch (e) {
      return { error: e };
    }
  };

  const signOut = async () => {
    setProfile(null);
    setUser(null);
    setCachedProfile(null);
    await supabase.auth.signOut();
  };

  const refreshProfile = () => fetchProfile(user?.id);

  const isAdmin = profile?.role === "admin";
  const isPending = profile?.role === "pending" || (user && !profile);
  const isApproved = profile?.role === "user" || profile?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        isAdmin,
        isPending,
        isApproved,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
