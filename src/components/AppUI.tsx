import type { PropsWithChildren } from "react";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const colors = {
  background: "#F6F7F2",
  border: "#E6E9E0",
  danger: "#B23A32",
  dangerBackground: "#FFF1EE",
  ink: "#18382B",
  muted: "#78847B",
  primary: "#286B4B",
  primaryDark: "#1B5037",
  success: "#2D7951",
  surface: "#FFFFFF",
  surfaceAlt: "#EDF3EC",
  warning: "#A56618",
  warningBackground: "#FFF4E2",
  white: "#FFFFFF",
};

type AppScreenProps = PropsWithChildren<{ scroll?: boolean }>;

export function AppScreen({ children, scroll = false }: AppScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "right", "bottom", "left"]}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {scroll ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.scrollInner}>{children}</View>
          </ScrollView>
        ) : (
          <View style={styles.content}>
            <View style={styles.contentInner}>{children}</View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type AuthLayoutProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  subtitle: string;
}>;

export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <AppScreen scroll>
      <View style={styles.authLayout}>
        <View style={styles.authHero}>
          <View style={styles.authHeroTop}>
            <View style={styles.brandMark}>
              <View style={styles.brandRoof} />
              <View style={styles.brandShop}>
                <View style={styles.brandDoor} />
              </View>
            </View>
            <View style={styles.brandNameWrap}>
              <Text style={styles.brandName}>MI TIENDA</Text>
              <Text style={styles.brandCaption}>Tu inventario, siempre cerca</Text>
            </View>
            <View style={styles.brandSpark} />
          </View>
          <View style={styles.authHeroCopy}>
            <Text style={styles.authEyebrow}>{eyebrow}</Text>
            <Text style={styles.authTitle}>{title}</Text>
            <Text style={styles.authSubtitle}>{subtitle}</Text>
          </View>
          <View style={styles.heroDecoration} />
          <View style={styles.heroDecorationSmall} />
        </View>
        <View style={styles.authCard}>{children}</View>
        <Text style={styles.authFooter}>HECHO PARA EL DÍA A DÍA DE TU TIENDA</Text>
      </View>
    </AppScreen>
  );
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
  compact?: boolean;
};

export function Button({
  label,
  onPress,
  disabled = false,
  secondary = false,
  compact = false,
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondaryButton,
        compact && styles.compactButton,
        pressed && !disabled && (secondary ? styles.pressedSecondary : styles.pressedButton),
        disabled && styles.disabledButton,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          secondary && styles.secondaryButtonText,
          compact && styles.compactButtonText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type FieldProps = TextInputProps & { label: string };

export function Field({ label, ...inputProps }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const { onBlur, onFocus } = inputProps;

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        {...inputProps}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        placeholderTextColor={colors.muted}
        style={[styles.input, focused && styles.inputFocused]}
      />
    </View>
  );
}

export function Notice({
  message,
  error = false,
}: {
  message: string;
  error?: boolean;
}) {
  return (
    <View style={[styles.notice, error ? styles.errorNotice : styles.successNotice]}>
      <View
        style={[styles.noticeMark, error ? styles.errorMark : styles.successMark]}
      />
      <Text
        accessibilityRole={error ? "alert" : undefined}
        style={[styles.noticeText, error ? styles.errorText : styles.successText]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  keyboard: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  contentInner: { flex: 1, alignSelf: "center", maxWidth: 720, width: "100%" },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  scrollInner: {
    flexGrow: 1,
    alignSelf: "center",
    justifyContent: "center",
    maxWidth: 720,
    width: "100%",
  },
  authLayout: { flex: 1, justifyContent: "center", paddingVertical: 8 },
  authHero: {
    backgroundColor: colors.primaryDark,
    borderRadius: 28,
    marginBottom: 14,
    minHeight: 224,
    overflow: "hidden",
    padding: 22,
  },
  authHeroTop: { alignItems: "center", flexDirection: "row", gap: 11 },
  brandMark: {
    alignItems: "center",
    backgroundColor: "#E9B96C",
    borderRadius: 15,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  brandRoof: {
    backgroundColor: colors.primaryDark,
    height: 9,
    position: "absolute",
    top: 10,
    transform: [{ rotate: "45deg" }],
    width: 9,
  },
  brandShop: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    height: 13,
    marginTop: 8,
    width: 18,
  },
  brandDoor: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
    borderTopLeftRadius: 3,
    height: 8,
    marginRight: 3,
    marginTop: 5,
    width: 5,
  },
  brandNameWrap: { gap: 2 },
  brandName: { color: colors.white, fontSize: 12, fontWeight: "900", letterSpacing: 1.5 },
  brandCaption: { color: "#C9D9CF", fontSize: 11, fontWeight: "500" },
  brandSpark: {
    backgroundColor: "#E9B96C",
    borderRadius: 5,
    height: 9,
    marginLeft: "auto",
    width: 9,
  },
  authHeroCopy: { marginTop: 28, maxWidth: 440, zIndex: 1 },
  authEyebrow: {
    color: "#E9B96C",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.7,
  },
  authTitle: { color: colors.white, fontSize: 28, fontWeight: "800", marginTop: 8 },
  authSubtitle: { color: "#D0DED5", fontSize: 14, lineHeight: 21, marginTop: 7 },
  heroDecoration: {
    borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 90,
    borderWidth: 20,
    height: 190,
    position: "absolute",
    right: -58,
    top: 78,
    width: 190,
  },
  heroDecorationSmall: {
    backgroundColor: "rgba(233,185,108,0.18)",
    borderRadius: 30,
    height: 50,
    position: "absolute",
    right: 48,
    top: 37,
    transform: [{ rotate: "28deg" }],
    width: 50,
  },
  authCard: {
    backgroundColor: colors.surface,
    borderColor: "#E7EDE5",
    borderRadius: 23,
    borderWidth: 1,
    padding: 20,
    shadowColor: "#18382B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 2,
  },
  authFooter: {
    color: "#98A39A",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginTop: 18,
    textAlign: "center",
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 14,
    justifyContent: "center",
    minHeight: 54,
    paddingHorizontal: 18,
    paddingVertical: 13,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 9,
    elevation: 2,
  },
  secondaryButton: {
    backgroundColor: colors.surfaceAlt,
    marginTop: 10,
    shadowOpacity: 0,
    elevation: 0,
  },
  compactButton: { borderRadius: 12, minHeight: 42, paddingHorizontal: 15, paddingVertical: 9 },
  pressedButton: { backgroundColor: colors.primaryDark },
  pressedSecondary: { backgroundColor: "#E2EBE1" },
  disabledButton: { opacity: 0.55 },
  buttonText: { color: colors.white, fontSize: 15, fontWeight: "800", letterSpacing: 0.2 },
  secondaryButtonText: { color: colors.ink },
  compactButtonText: { fontSize: 12 },
  field: { marginBottom: 17 },
  fieldLabel: { color: colors.ink, fontSize: 13, fontWeight: "800", marginBottom: 8 },
  input: {
    backgroundColor: "#FAFBF9",
    borderColor: "#E1E8E0",
    borderRadius: 13,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    minHeight: 54,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  inputFocused: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
  notice: {
    alignItems: "flex-start",
    borderRadius: 13,
    flexDirection: "row",
    gap: 9,
    marginBottom: 15,
    padding: 13,
  },
  errorNotice: { backgroundColor: colors.dangerBackground },
  successNotice: { backgroundColor: colors.surfaceAlt },
  noticeMark: { borderRadius: 4, height: 8, marginTop: 5, width: 8 },
  errorMark: { backgroundColor: colors.danger },
  successMark: { backgroundColor: colors.success },
  noticeText: { flex: 1, fontSize: 13, lineHeight: 19 },
  errorText: { color: colors.danger },
  successText: { color: colors.primaryDark },
});
