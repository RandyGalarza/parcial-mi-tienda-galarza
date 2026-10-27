import { useState } from "react";
import { Link, router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AuthLayout, Button, Field, Notice, colors } from "@/components/AppUI";
import { useAuth } from "@/context/AuthContext";

export default function Registro() {
  const { initializationError, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSignUp() {
    setError(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);
    try {
      await signUp(email.trim(), password);
      router.replace("/");
    } catch (signUpError) {
      setError(
        signUpError instanceof Error
          ? signUpError.message
          : "No fue posible crear la cuenta. Revisa tus datos e inténtalo de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="EMPIEZA EN UN MOMENTO"
      title="Registra tu tienda"
      subtitle="Crea una cuenta para respaldar tus productos en la nube."
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
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
        />
        <Field
          label="Confirmar contraseña"
          value={confirmation}
          onChangeText={setConfirmation}
          secureTextEntry
          autoComplete="new-password"
          placeholder="Escribe de nuevo tu contraseña"
        />
        <Button
          label={submitting ? "Creando cuenta..." : "Crear cuenta"}
          onPress={() => void handleSignUp()}
          disabled={submitting || Boolean(initializationError)}
        />

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
          <Link href="/login" style={styles.link}>
            Iniciar sesión
          </Link>
        </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  loginRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 22,
  },
  loginText: { color: colors.muted, fontSize: 13 },
  link: { color: colors.primary, fontSize: 13, fontWeight: "800" },
});
