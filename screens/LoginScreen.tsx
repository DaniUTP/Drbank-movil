import { useRouter } from "expo-router";
import React, { memo, useCallback, useMemo, useState } from "react";
import {
    Keyboard,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import type { ThemeColors } from "../components/ThemeContext";
import { useTheme } from "../components/ThemeContext";

// ============================================
// STYLES - Static styles (no recreation on render)
// ============================================
const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
  formContent: {
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#64748b",
    marginTop: 5,
  },
  inputGroup: {
    marginTop: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#64748b",
  },
  input: {
    height: 55,
    borderRadius: 18,
    paddingHorizontal: 15,
    borderWidth: 1,
    marginTop: 5,
  },
  button: {
    marginTop: 25,
    height: 55,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

// ============================================
// INPUT FIELD COMPONENT - Memoized with colors prop
// ============================================
interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  colors: ThemeColors;
  inputRef?: React.RefObject<TextInput | null>;
  onSubmitEditing?: () => void;
  returnKeyType?: "next" | "done" | "go";
}

// Memoized to prevent re-renders when parent re-renders with same props
const InputField = memo<InputFieldProps>(function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  colors,
  inputRef,
  onSubmitEditing,
  returnKeyType = "next",
}) {
  // Memoize style objects to prevent recreation on each render
  const labelStyle = useMemo(
    () => [styles.label, { color: colors.label }],
    [colors.label]
  );

  const inputStyle = useMemo(
    () => [styles.input, { borderColor: colors.inputBorder, color: colors.text }],
    [colors.inputBorder, colors.text]
  );

  return (
    <View style={styles.inputGroup}>
      <Text style={labelStyle}>{label}</Text>
      <TextInput
        ref={inputRef}
        style={inputStyle}
        placeholder={placeholder}
        placeholderTextColor={colors.subtitle}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        returnKeyType={returnKeyType}
        blurOnSubmit={false}
        onSubmitEditing={onSubmitEditing}
      />
    </View>
  );
});

// Prevent hydration mismatch
InputField.displayName = "InputField";

// ============================================
// LOGIN SCREEN - Optimized
// ============================================
function LoginScreen() {
  // Separate state for each field - prevents re-renders on other fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Get theme colors - already memoized in context
  const { colors } = useTheme();
  const router = useRouter();

  // Create refs for input navigation - stable references
  const emailInputRef = useMemo(() => React.createRef<TextInput>(), []);
  const passwordInputRef = useMemo(() => React.createRef<TextInput>(), []);

  // ============================================
  // HANDLERS - Memoized with useCallback
  // ============================================
  const handleEmailChange = useCallback((text: string) => setEmail(text), []);
  const handlePasswordChange = useCallback((text: string) => setPassword(text), []);

  // Navigation handlers
  const handleEmailSubmit = useCallback(() => {
    passwordInputRef.current?.focus();
  }, [passwordInputRef]);

  const handlePasswordSubmit = useCallback(() => {
    Keyboard.dismiss();
    handleLogin();
  }, []);

  // Main action handler - memoized
  const handleLogin = useCallback(() => {
    router.replace("/dashboard");
  }, [router]);

  // ============================================
  // DYNAMIC STYLES - Memoized to avoid recreation
  // ============================================
  const titleStyle = useMemo(
    () => [styles.title, { color: colors.text }],
    [colors.text]
  );

  const subtitleStyle = useMemo(
    () => [styles.subtitle, { color: colors.subtitle }],
    [colors.subtitle]
  );

  const buttonStyle = useMemo(
    () => [styles.button, { backgroundColor: colors.buttonBg }],
    [colors.buttonBg]
  );

  const buttonTextStyle = useMemo(
    () => [styles.buttonText, { color: colors.buttonText }],
    [colors.buttonText]
  );

  // ============================================
  // RENDER
  // ============================================
  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.formContent}>
        <Text style={titleStyle}>Bienvenido a DrBank</Text>
        <Text style={subtitleStyle}>Tu carrera médica, optimizada.</Text>

        <InputField
          label="EMAIL INSTITUCIONAL"
          value={email}
          onChangeText={handleEmailChange}
          placeholder="nombre@hospital.com"
          colors={colors}
          inputRef={emailInputRef}
          onSubmitEditing={handleEmailSubmit}
          returnKeyType="next"
        />

        <InputField
          label="CONTRASEÑA"
          value={password}
          onChangeText={handlePasswordChange}
          placeholder="••••••••"
          secureTextEntry
          colors={colors}
          inputRef={passwordInputRef}
          onSubmitEditing={handlePasswordSubmit}
          returnKeyType="done"
        />

        <Pressable
          style={({ pressed }) => [
            buttonStyle,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleLogin}
          hitSlop={8}
        >
          <Text style={buttonTextStyle}>Iniciar Sesión</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// Export directly - no need for memo on screen components
// that don't receive props (Expo Router handles rendering)
export default LoginScreen;
