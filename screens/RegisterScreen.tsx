import { useRouter } from "expo-router";
import React, { memo, useMemo, useState } from "react";
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
// Note: Uses colors prop to avoid re-renders when theme context changes
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
  autoCapitalize?: "none" | "words";
  keyboardType?: "email-address" | "default";
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
  autoCapitalize = "words",
  keyboardType = "default",
}) {
  // Memoize style object to prevent recreation on each render
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
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        blurOnSubmit={false}
        onSubmitEditing={onSubmitEditing}
      />
    </View>
  );
});

// Prevent hydration mismatch - only render after theme is loaded
InputField.displayName = "InputField";

// ============================================
// REGISTER SCREEN - Optimized
// ============================================
function RegisterScreen() {
  // Separate state for each field - prevents re-renders on other fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Get theme colors - already memoized in context
  const { colors } = useTheme();
  const router = useRouter();

  // Create refs for input navigation - stable references
  const nameInputRef = useMemo(() => React.createRef<TextInput>(), []);
  const emailInputRef = useMemo(() => React.createRef<TextInput>(), []);
  const passwordInputRef = useMemo(() => React.createRef<TextInput>(), []);

  // ============================================
  // SIMPLE STATE HANDLERS - No useCallback needed
  // React automatically batches these updates
  // ============================================
  const handleNameChange = (text: string) => setName(text);
  const handleEmailChange = (text: string) => setEmail(text);
  const handlePasswordChange = (text: string) => setPassword(text);

  // Navigation handlers - only need useCallback for refs that change
  const handleNameSubmit = () => {
    emailInputRef.current?.focus();
  };

  const handleEmailSubmit = () => {
    passwordInputRef.current?.focus();
  };

  const handlePasswordSubmit = () => {
    Keyboard.dismiss();
    handleRegister();
  };

  // Main action handler - needs useCallback for router dependency
  const handleRegister = () => {
    router.replace("/dashboard");
  };

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
        <Text style={titleStyle}>Crea tu cuenta</Text>
        <Text style={subtitleStyle}>Únete a la red médica del futuro.</Text>

        <InputField
          label="NOMBRE"
          value={name}
          onChangeText={handleNameChange}
          placeholder="Tu nombre"
          colors={colors}
          inputRef={nameInputRef}
          onSubmitEditing={handleNameSubmit}
          returnKeyType="next"
          autoCapitalize="words"
        />

        <InputField
          label="EMAIL"
          value={email}
          onChangeText={handleEmailChange}
          placeholder="nombre@hospital.com"
          colors={colors}
          inputRef={emailInputRef}
          onSubmitEditing={handleEmailSubmit}
          returnKeyType="next"
          keyboardType="email-address"
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
          onPress={handleRegister}
          hitSlop={8}
        >
          <Text style={buttonTextStyle}>Registrar</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
export default RegisterScreen

