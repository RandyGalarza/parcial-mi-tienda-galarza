import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseClient } from "@/lib/supabase";

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  initializationError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Ocurrió un error al preparar la autenticación.";
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [client, setClient] = useState<SupabaseClient<Database> | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    async function initialize() {
      try {
        const supabase = getSupabaseClient();
        if (!active) return;
        setClient(supabase);

        const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
          if (active) setSession(nextSession);
        });
        unsubscribe = () => data.subscription.unsubscribe();

        const { data: sessionData, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (active) {
          setSession(sessionData.session);
          setInitializationError(null);
        }
      } catch (error) {
        if (active) setInitializationError(errorMessage(error));
      } finally {
        if (active) setLoading(false);
      }
    }

    void initialize();
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const getClient = useCallback(
    () => client ?? getSupabaseClient(),
    [client],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await getClient().auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    },
    [getClient],
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await getClient().auth.signUp({ email, password });
      if (error) throw error;
      if (!data.session) {
        throw new Error(
          "La cuenta se creó, pero falta confirmar el correo. Desactiva la confirmación por correo en Supabase para iniciar sesión inmediatamente.",
        );
      }
    },
    [getClient],
  );

  const signOut = useCallback(async () => {
    const { error } = await getClient().auth.signOut();
    if (error) throw error;
  }, [getClient]);

  const value = useMemo(
    () => ({
      session,
      loading,
      initializationError,
      signIn,
      signUp,
      signOut,
    }),
    [session, loading, initializationError, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error("useAuth debe usarse dentro de AuthProvider.");
  }
  return auth;
}
