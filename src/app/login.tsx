import { useState } from "react";
import { Link, router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AuthLayout, Button, Field, Notice, colors } from "@/components/AppUI";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { initializationError, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSignIn() {
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/");
    } catch (signInError) {
      setError(
        signInError instanceof Error
          ? signInError.message
          : "No fue posible iniciar sesión. Revisa tus datos e inténtalo de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="QUÉ BUENO TENERTE DE VUELTA"
      title="Bienvenida a tu tienda"
      subtitle="Inicia sesión para cuidar tu inventario, incluso cuando no hay señal."
    >
        {initializationError ? (
          <Notice message={initializationError} error />
        ) : null}
        {error ? <Notice message={error} error /> : null}

        <Field
          label="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="tu@tienda.com"
        />
        <Field
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          placeholder="Tu contraseña"
        />
        <Button
          label={submitting ? "Ingresando..." : "Ingresar"}
          onPress={() => void handleSignIn()}
          disabled={submitting || Boolean(initializationError)}
        />

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>¿Aún no tienes cuenta? </Text>
          <Link href="/registro" style={styles.link}>
            Crear cuenta
          </Link>
        </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  registerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 22,
  },
  registerText: { color: colors.muted, fontSize: 13 },
  link: { color: colors.primary, fontSize: 13, fontWeight: "800" },
});
