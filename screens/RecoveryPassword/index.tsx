import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import InputField from "../../common/InputField";
import { useTheme } from "../../common/ThemeContext";
import { useRecoveryMutation } from "../../services/auth/recovery.rtkq";
import { validateEmail } from "../../utils/login/validation";
import { styles } from "./styles";

// ============================================
// RECOVERY PASSWORD SCREEN
// ============================================
function RecoveryPasswordScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const { colors } = useTheme();
  const [recovery] = useRecoveryMutation();

  const emailInputRef = useMemo(() => React.createRef<TextInput>(), []);

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    if (error) {
      setError("");
    }
  }, [error]);

  const handleRecovery = useCallback(async () => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error || "Email inválido");
      return;
    }

    setIsLoading(true);
    try {
      const result = await recovery({ email }).unwrap();
      // Show success message in modal using global function
      (global as any).showAuthModal(
        "Recuperación de Contraseña",
        result?.message || "Se ha enviado un correo para recuperar tu contraseña",
        require("../../assets/logo_app.png"),
        () => router.replace("/login")
      );
    } catch (err: any) {
      setError(err?.data?.message || "Error al enviar correo de recuperación");
    } finally {
      setIsLoading(false);
    }
  }, [email, recovery]);

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContent}>
          <Text style={titleStyle}>Recuperar Contraseña</Text>
          <Text style={subtitleStyle}>
            Ingresa tu correo electrónico para recibir instrucciones
          </Text>

          <InputField
            label="CORREO ELECTRÓNICO"
            value={email}
            onChangeText={handleEmailChange}
            placeholder="nombre@hospital.com"
            colors={colors}
            inputRef={emailInputRef}
            onSubmitEditing={handleRecovery}
            error={error}
            keyboardType="email-address"
          />

          <Pressable
            style={({ pressed }) => [
              buttonStyle,
              pressed && styles.buttonPressed,
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleRecovery}
            hitSlop={8}
            disabled={isLoading}
          >
            <Text style={buttonTextStyle}>
              {isLoading ? "Enviando..." : "Enviar Correo"}
            </Text>
          </Pressable>

          <Pressable onPress={() => router.back()} style={styles.backContainer}>
            <Text style={[styles.backText, { color: colors.subtitle }]}>
              Volver
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default RecoveryPasswordScreen;
