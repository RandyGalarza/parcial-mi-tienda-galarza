import { Suspense, useEffect, useState, type PropsWithChildren } from "react";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "../../drizzle/migrations";
import { AppScreen, Notice, colors } from "@/components/AppUI";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DatabaseProvider, useDatabase } from "@/db/DatabaseContext";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

const sqliteOptions = { enableChangeListener: true };

function WebSQLiteLock({ children }: PropsWithChildren) {
  const [lockState, setLockState] = useState<"waiting" | "ready" | "error">(
    "waiting",
  );
  const [lockError, setLockError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let releaseLock: (() => void) | undefined;
    const holdLock = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });

    const lockRequest = navigator.locks
      ? navigator.locks.request(
          "mi-tienda-sqlite",
          { mode: "exclusive" },
          async () => {
            if (cancelled) return;
            setLockState("ready");
            await holdLock;
          },
        )
      : Promise.reject(
          new Error(
            "Este navegador no permite coordinar el acceso a la base de datos. Abre la app en una sola pestaña de un navegador actualizado.",
          ),
        );

    void lockRequest
      .catch((error: unknown) => {
        if (cancelled) return;
        setLockError(
          error instanceof Error
            ? error.message
            : "No se pudo reservar el acceso a la base de datos.",
        );
        setLockState("error");
      });

    return () => {
      cancelled = true;
      releaseLock?.();
    };
  }, []);

  if (lockState === "error") {
    return (
      <AppScreen>
        <View style={styles.center}>
          <Notice message={lockError ?? "No se pudo abrir la base de datos."} error />
        </View>
      </AppScreen>
    );
  }

  if (lockState === "waiting") {
    return (
      <AppScreen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>
            Esperando acceso a la base de datos...
          </Text>
        </View>
      </AppScreen>
    );
  }

  return children;
}

function Navigation() {
  const { loading, session } = useAuth();

  if (loading) {
    return (
      <AppScreen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Cargando tu tienda...</Text>
        </View>
      </AppScreen>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!session} redirectTo="/">
        <Stack.Screen name="login" />
        <Stack.Screen name="registro" />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(session)} redirectTo="/login">
        <Stack.Screen name="index" />
        <Stack.Screen name="producto" />
      </Stack.Protected>
    </Stack>
  );
}

function DatabaseGate() {
  const database = useDatabase();
  const { success, error } = useMigrations(database, migrations);

  if (error) {
    return (
      <AppScreen>
        <View style={styles.center}>
          <Notice
            message={`No se pudo preparar la base de datos local: ${error.message}`}
            error
          />
        </View>
      </AppScreen>
    );
  }
  if (!success) {
    return (
      <AppScreen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Preparando inventario...</Text>
        </View>
      </AppScreen>
    );
  }

  return <Navigation />;
}

export default function RootLayout() {
  const sqliteProvider = (
    <SQLiteProvider
      databaseName="mi-tienda.db"
      options={sqliteOptions}
      useSuspense
    >
      <DatabaseProvider>
        <AuthProvider>
          <DatabaseGate />
        </AuthProvider>
      </DatabaseProvider>
    </SQLiteProvider>
  );
  const suspenseProvider = (
    <Suspense
      fallback={
        <AppScreen>
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.loadingText}>Preparando inventario...</Text>
          </View>
        </AppScreen>
      }
    >
      {sqliteProvider}
    </Suspense>
  );

  return Platform.OS === "web" ? (
    <WebSQLiteLock>{suspenseProvider}</WebSQLiteLock>
  ) : (
    suspenseProvider
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center" },
  loadingText: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
  },
});
