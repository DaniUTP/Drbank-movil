import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { useLoginMutation } from "../../services/auth/login.rtkq";
import { validateLoginForm } from "../../utils/login/validation";
import { styles } from "./styles";

// ============================================
// LOGIN SCREEN - Optimized
// ============================================
function LoginScreen() {
  // Separate state for each field - prevents re-renders on other fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Get theme colors - already memoized in context
  const { colors } = useTheme();
  const router = useRouter();

  // Login mutation
  const [loginMutation] = useLoginMutation();

  // Create refs for input navigation - stable references
  const emailInputRef = useMemo(() => React.createRef<TextInput>(), []);
  const passwordInputRef = useMemo(() => React.createRef<TextInput>(), []);

  // ============================================
  // HANDLERS - Memoized with useCallback
  // ============================================
  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    // Clear email error when user types
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  }, [errors.email]);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    // Clear password error when user types
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
  }, [errors.password]);

  // Navigation handlers
  const handleEmailSubmit = useCallback(() => {
    passwordInputRef.current?.focus();
  }, [passwordInputRef]);

  const handlePasswordSubmit = useCallback(() => {
    Keyboard.dismiss();
    handleLogin();
  }, []);

  // Main action handler - memoized with validation and API call
  const handleLogin = useCallback(async () => {
    const validation = validateLoginForm(email, password);

    if (!validation.isValid) {
      setErrors({
        email: validation.email.error,
        password: validation.password.error,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get FCM token
      const fcmToken = await getFCMToken();

      // Call login API
      const result = await loginMutation({
        email,
        password,
        token_fcm: fcmToken || '',
      }).unwrap();

      // Store auth token with expiration if remember me is checked
      if (rememberMe) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7); // 1 week from now
        await AsyncStorage.setItem('access_token', result.access_token);
        await AsyncStorage.setItem('token_expiration', expirationDate.toISOString());
      } else {
        await AsyncStorage.setItem('access_token', result.access_token);
        await AsyncStorage.removeItem('token_expiration');
      }

      console.log('Login successful:', result);

      // Navigate to dashboard
      router.replace("/dashboard");
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle inactive account error (400 with E0001)
      if (error?.status === 400 && error?.data?.code === 'E0001') {
        // Navigate to activate-account with email, the API call will be made there
        router.replace({ pathname: '/activate-account', params: { email, showModal: 'true' } });
        return;
      }
      
      // Handle backend validation errors
      if (error?.data?.errors) {
        const backendErrors = error.data.errors as { [key: string]: string };
        setErrors({
          email: backendErrors.email,
          password: backendErrors.password,
        });
      } else {
        // Handle general error
        setErrors({
          email: error?.data?.message || 'Error al iniciar sesión',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, password, router, loginMutation]);

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
          error={errors.email}
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
          error={errors.password}
        />

        <View style={styles.formActions}>
          <Pressable
            style={styles.rememberMeContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={[styles.checkbox, rememberMe && { backgroundColor: colors.buttonBg }]}>
              {rememberMe && <Text style={[styles.checkmark, { color: colors.buttonText }]}>✓</Text>}
            </View>
            <Text style={[styles.rememberMeText, { color: colors.text }]}>
              Recuérdame
            </Text>
          </Pressable>

          <Pressable onPress={() => router.push('/recovery-password')}>
            <Text style={[styles.forgotPassword, { color: colors.buttonBg }]}>
              ¿Olvidaste tu contraseña?
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [
            buttonStyle,
            pressed && styles.buttonPressed,
            isLoading && styles.buttonDisabled,
          ]}
          onPress={handleLogin}
          hitSlop={8}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={buttonTextStyle}>Cargando...</Text>
          ) : (
            <Text style={buttonTextStyle}>Iniciar Sesión</Text>
          )}
        </Pressable>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Export directly - no need for memo on screen components
// that don't receive props (Expo Router handles rendering)
export default LoginScreen;
