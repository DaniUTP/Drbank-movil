import { Eye, EyeOff } from "lucide-react-native";
import React, { memo, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import type { ThemeColors } from "./ThemeContext";

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  colors: ThemeColors;
  secureTextEntry?: boolean;
  inputRef?: React.RefObject<TextInput | null>;
  onSubmitEditing?: () => void;
  returnKeyType?: "next" | "done" | "go";
  error?: string;
  maxLength?: number;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  textAlign?: "left" | "center" | "right";
  textTransform?: "none" | "capitalize" | "lowercase" | "uppercase";
}

const InputField = memo<InputFieldProps>(function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  colors,
  secureTextEntry = false,
  inputRef,
  onSubmitEditing,
  returnKeyType = "next",
  error,
  maxLength,
  keyboardType = "default",
  autoCapitalize = "none",
  autoCorrect = false,
  textAlign = "left",
  textTransform = "none",
}) {
  const [showPassword, setShowPassword] = useState(false);

  const labelStyle = useMemo(
    () => ({
      fontSize: 12,
      fontWeight: "bold" as const,
      color: colors.label,
    }),
    [colors.label]
  );

  const inputStyle = useMemo(
    () => ({
      height: 55,
      borderRadius: 18,
      paddingHorizontal: 15,
      borderWidth: 1,
      marginTop: 5,
      borderColor: error ? '#ef4444' : colors.inputBorder,
      color: colors.text,
      textAlign,
      textTransform,
    }),
    [colors.inputBorder, colors.text, error, textAlign, textTransform]
  );

  const errorStyle = useMemo(
    () => ({
      fontSize: 12,
      marginTop: 5,
      color: '#ef4444',
    }),
    []
  );

  const containerStyle = useMemo(
    () => ({
      marginTop: 20,
    }),
    []
  );

  const inputContainerStyle = useMemo(
    () => ({
      position: 'relative' as const,
    }),
    []
  );

  return (
    <View style={containerStyle}>
      <Text style={labelStyle}>{label}</Text>
      <View style={inputContainerStyle}>
        <TextInput
          ref={inputRef}
          style={inputStyle}
          placeholder={placeholder}
          placeholderTextColor={colors.subtitle}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          maxLength={maxLength}
          onSubmitEditing={onSubmitEditing}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: 15,
              top: 20,
              padding: 4,
            }}
          >
            {showPassword ? (
              <EyeOff size={20} color={colors.subtitle} />
            ) : (
              <Eye size={20} color={colors.subtitle} />
            )}
          </Pressable>
        )}
      </View>
      {error && <Text style={errorStyle}>{error}</Text>}
    </View>
  );
});

InputField.displayName = "InputField";

export default InputField;
