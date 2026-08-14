import { getFCMToken } from "@/FirebaseConfig";
import { useLoginMutation } from "@/services/auth/login.rtkq";
import { validateLoginForm } from "@/utils/login/validation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
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
import { styles } from "./styles";

export function LoginScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // RTK Query mutation hook
  const [loginMutation] = useLoginMutation();

  // Input refs for focus management
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  // Field change handlers
  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  }, [errors.email]);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
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

  // Main action handler
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
      const fcmToken = await getFCMToken();

      const result = await loginMutation({
        email,
        password,
        token_fcm: fcmToken || '',
      }).unwrap();

      if (rememberMe) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);
        await AsyncStorage.setItem('access_token', result.access_token);
        await AsyncStorage.setItem('token_expiration', expirationDate.toISOString());
      } else {
        await AsyncStorage.setItem('access_token', result.access_token);
        await AsyncStorage.removeItem('token_expiration');
      }

      router.replace("/dashboard");
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error?.status === 400 && error?.data?.code === 'E0001') {
        router.replace({ pathname: '/activate-account', params: { email, showModal: 'true' } });
        return;
      }
      
      if (error?.data?.errors) {
        const backendErrors = error.data.errors as { [key: string]: string };
        setErrors({
          email: backendErrors.email,
          password: backendErrors.password,
        });
      } else {
        setErrors({
          email: error?.data?.message || 'Error al iniciar sesión',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, password, router, loginMutation, rememberMe]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContent}>
          <Text style={[styles.title, { color: colors.text }]}>
            Bienvenido a DrBank
          </Text>
          <Text style={[styles.subtitle, { color: colors.subtitle || "#64748b" }]}>
            Tu carrera médica, optimizada.
          </Text>

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

          {/* Unified Clean Actions Row */}
          <View style={styles.actionsRow}>
            <Pressable
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
              hitSlop={6}
            >
              <View
                style={[
                  styles.checkbox,
                  rememberMe && { backgroundColor: "#0284c7", borderColor: "#0284c7" },
                ]}
              >
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.rememberMeText, { color: colors.subtitle || "#64748b" }]}>
                Recordarme
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/recovery-password')}
              hitSlop={6}
            >
              <Text style={[styles.forgotPassword, { color: "#0284c7" }]}>
                ¿Olvidaste tu contraseña?
              </Text>
            </Pressable>
          </View>

          {/* Login Submit Button */}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            hitSlop={8}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default LoginScreen;
