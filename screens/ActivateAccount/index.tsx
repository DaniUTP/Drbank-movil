import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../common/ThemeContext";
import { useActivateAccountMutation, useResendActivationMutation } from "../../services/auth/activate-account.rtkq";
import { styles } from "./styles";

// ============================================
// ACTIVATE ACCOUNT SCREEN
// ============================================
function ActivateAccountScreen() {
  const { email, showModal } = useLocalSearchParams<{ email?: string; showModal?: string }>();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { colors } = useTheme();
  const [activateAccount] = useActivateAccountMutation();
  const [resendActivation] = useResendActivationMutation();

  // Create refs for each input
  const inputRefs = useRef([
    React.createRef<TextInput>(),
    React.createRef<TextInput>(),
    React.createRef<TextInput>(),
    React.createRef<TextInput>(),
    React.createRef<TextInput>(),
    React.createRef<TextInput>(),
  ]);

  const handleCodeChange = useCallback((text: string, index: number) => {
    // Only allow lowercase letters and limit to 1 character
    const lowercaseText = text.toLowerCase().slice(0, 1);
    const newCode = [...code];
    newCode[index] = lowercaseText;
    setCode(newCode);
    
    if (error) {
      setError("");
    }

    // Auto-focus next input
    if (lowercaseText && index < 5) {
      inputRefs.current[index + 1]?.current?.focus();
    }
  }, [code, error]);

  const handleKeyPress = useCallback((e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.current?.focus();
    }
  }, [code]);

  const handleActivate = useCallback(async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("El código debe tener 6 caracteres");
      return;
    }

    if (!email) {
      setError("Email no proporcionado");
      return;
    }

    setIsLoading(true);
    try {
      await activateAccount({ email: email as string, code: fullCode }).unwrap();
      
      // After successful activation, navigate to login
      router.replace("/login");
    } catch (err: any) {
      // Show API error message
      setError(err?.data?.message || err?.data?.error || "Código inválido");
    } finally {
      setIsLoading(false);
    }
  }, [code, email, activateAccount]);

  const handleResend = useCallback(async () => {
    if (!email) {
      setError("Email no proporcionado");
      return;
    }

    setIsResending(true);
    try {
      await resendActivation({ email: email as string }).unwrap();
      // Show success message in modal
      (global as any).showAuthModal(
        "Código Reenviado",
        "Se ha enviado un nuevo código de activación a tu correo",
        require("../../assets/logo_app.png"),
        () => {
          // Start countdown after modal closes
          setCountdown(10);
        }
      );
    } catch (err: any) {
      // Show API error message
      setError(err?.data?.message || err?.data?.error || "Error al reenviar código");
    } finally {
      setIsResending(false);
    }
  }, [email, resendActivation]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Show modal when coming from Login with inactive account
  useEffect(() => {
    if (showModal === 'true' && email) {
      // Call resend activation API
      resendActivation({ email: email as string });
      
      (global as any).showAuthModal(
        "Cuenta No Activada",
        "Se ha enviado un código de activación a tu correo electrónico",
        require("../../assets/logo_app.png")
      );
    }
  }, [showModal, email, resendActivation]);

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

  const linkStyle = useMemo(
    () => [styles.link, { color: colors.buttonBg }],
    [colors.buttonBg]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContent}>
          <Text style={titleStyle}>Activar Cuenta</Text>
          <Text style={subtitleStyle}>
            Ingresa el código de 6 dígitos que enviamos a tu correo
          </Text>

          {/* 6 separate code input containers */}
          <View style={styles.codeContainer}>
            {code.map((char, index) => (
              <TextInput
                key={index}
                ref={inputRefs.current[index]}
                style={[
                  styles.codeInput,
                  { 
                    borderColor: error ? '#ef4444' : '#e2e8f0',
                    backgroundColor: colors.card,
                    color: colors.text
                  }
                ]}
                value={char}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                maxLength={1}
                autoCapitalize="none"
                autoCorrect={false}
                textAlign="center"
                keyboardType="default"
              />
            ))}
          </View>

          {error && <Text style={[styles.errorText, { color: '#ef4444' }]}>{error}</Text>}

          <Pressable
            style={({ pressed }) => [
              buttonStyle,
              pressed && styles.buttonPressed,
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleActivate}
            hitSlop={8}
            disabled={isLoading}
          >
            <Text style={buttonTextStyle}>
              {isLoading ? "Activando..." : "Activar Cuenta"}
            </Text>
          </Pressable>

          <Pressable 
            onPress={handleResend} 
            style={styles.resendContainer}
            disabled={isResending || countdown > 0}
          >
            <Text style={[linkStyle, (isResending || countdown > 0) && { opacity: 0.5 }]}>
              {isResending ? "Reenviando..." : countdown > 0 ? `Reenviar código (${countdown}s)` : "Reenviar código"}
            </Text>
          </Pressable>

          <Pressable onPress={() => router.replace("/login")} style={styles.backContainer}>
            <Text style={[styles.backText, { color: colors.subtitle }]}>
              Volver
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default ActivateAccountScreen;
