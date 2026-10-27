import { Suspense } from "react";
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
  return (
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
      <SQLiteProvider
        databaseName="mi-tienda.db"
        useSuspense={Platform.OS === "web"}
      >
        <DatabaseProvider>
          <AuthProvider>
            <DatabaseGate />
          </AuthProvider>
        </DatabaseProvider>
      </SQLiteProvider>
    </Suspense>
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
