import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import InputField from "../../common/InputField";
import { useTheme } from "../../common/ThemeContext";
import { getFCMToken } from "../../FirebaseConfig";
import { useRegisterMutation } from "../../services/auth/register.rtqk";
import { validateRegisterForm } from "../../utils/register/validation";
import { styles } from "./styles";

// ============================================
// REGISTER SCREEN - Optimized
// ============================================
function RegisterScreen() {
  // Separate state for each field - prevents re-renders on other fields
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [university, setUniversity] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    lastName?: string;
    email?: string;
    password?: string;
    university?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Get theme colors - already memoized in context
  const { colors } = useTheme();
  const router = useRouter();

  // Register mutation
  const [registerMutation] = useRegisterMutation();

  // Create refs for input navigation - stable references
  const nameInputRef = useMemo(() => React.createRef<TextInput>(), []);
  const lastNameInputRef = useMemo(() => React.createRef<TextInput>(), []);
  const emailInputRef = useMemo(() => React.createRef<TextInput>(), []);
  const passwordInputRef = useMemo(() => React.createRef<TextInput>(), []);
  const universityInputRef = useMemo(() => React.createRef<TextInput>(), []);

  // ============================================
  // HANDLERS - Memoized with useCallback
  // ============================================
  const handleNameChange = useCallback((text: string) => {
    setName(text);
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
  }, [errors.name]);

  const handleLastNameChange = useCallback((text: string) => {
    setLastName(text);
    if (errors.lastName) {
      setErrors(prev => ({ ...prev, lastName: undefined }));
    }
  }, [errors.lastName]);

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  }, [errors.email]);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
  }, [errors.password]);

  const handleUniversityChange = useCallback((text: string) => {
    setUniversity(text);
    if (errors.university) {
      setErrors(prev => ({ ...prev, university: undefined }));
    }
  }, [errors.university]);

  // Navigation handlers
  const handleNameSubmit = useCallback(() => {
    lastNameInputRef.current?.focus();
  }, []);

  const handleLastNameSubmit = useCallback(() => {
    emailInputRef.current?.focus();
  }, []);

  const handleEmailSubmit = useCallback(() => {
    passwordInputRef.current?.focus();
  }, []);

  const handlePasswordSubmit = useCallback(() => {
    universityInputRef.current?.focus();
  }, []);

  const handleUniversitySubmit = useCallback(() => {
    Keyboard.dismiss();
    handleRegister();
  }, []);

  // Main action handler - memoized with validation and API call
  const handleRegister = useCallback(async () => {
    const validation = validateRegisterForm(name, lastName, email, password, university);

    if (!validation.isValid) {
      setErrors({
        name: validation.name.error,
        lastName: validation.lastName.error,
        email: validation.email.error,
        password: validation.password.error,
        university: validation.university.error,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get FCM token
      const fcmToken = await getFCMToken();

      // Call register API
      const result = await registerMutation({
        name,
        last_name: lastName,
        email,
        password,
        university,
        token_fcm: fcmToken || undefined,
      }).unwrap();

      console.log('Register successful:', result);

      // Show success modal with API response
      (global as any).showAuthModal(
        "Registro Exitoso",
        result?.message || "Tu cuenta ha sido creada exitosamente",
        require("../../assets/logo_app.png"),
        () => router.replace({ pathname: "/activate-account", params: { email } })
      );
    } catch (error: any) {
      console.error('Register error:', error);
      // Handle backend validation errors
      if (error?.data?.errors) {
        setErrors({
          name: error.data.errors.name,
          lastName: error.data.errors.last_name,
          email: error.data.errors.email,
          password: error.data.errors.password,
          university: error.data.errors.university,
        });
      } else {
        // Handle general error
        setErrors({
          email: error?.data?.message || "Error al registrar usuario",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [name, lastName, email, password, university, router, registerMutation]);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
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
          error={errors.name}
        />

        <InputField
          label="APELLIDO"
          value={lastName}
          onChangeText={handleLastNameChange}
          placeholder="Tu apellido"
          colors={colors}
          inputRef={lastNameInputRef}
          onSubmitEditing={handleLastNameSubmit}
          returnKeyType="next"
          autoCapitalize="words"
          error={errors.lastName}
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
          error={errors.email}
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
          returnKeyType="next"
          error={errors.password}
        />

        <InputField
          label="UNIVERSIDAD (OPCIONAL)"
          value={university}
          onChangeText={handleUniversityChange}
          placeholder="Nombre de universidad"
          colors={colors}
          inputRef={universityInputRef}
          onSubmitEditing={handleUniversitySubmit}
          returnKeyType="done"
          autoCapitalize="words"
          error={errors.university}
        />

        <Pressable
          style={({ pressed }) => [
            buttonStyle,
            pressed && styles.buttonPressed,
            isLoading && styles.buttonDisabled,
          ]}
          onPress={handleRegister}
          hitSlop={8}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={buttonTextStyle}>Cargando...</Text>
          ) : (
            <Text style={buttonTextStyle}>Registrar</Text>
          )}
        </Pressable>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}
export default RegisterScreen

