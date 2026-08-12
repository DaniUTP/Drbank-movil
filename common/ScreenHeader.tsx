import React from "react";
import { Pressable, Text, View } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { useTheme } from "./ThemeContext";

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  showBackButton?: boolean;
}

export default function ScreenHeader({ 
  title, 
  onBack, 
  rightAction,
  showBackButton = true 
}: ScreenHeaderProps) {
  const { colors } = useTheme();
  const router = onBack ? undefined : require("expo-router").useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router) {
      router.back();
    }
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.background }}>
      {showBackButton ? (
        <Pressable onPress={handleBack} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center", backgroundColor: colors.card, borderRadius: 10 }}>
          {/* ArrowLeft icon would be imported and used here */}
          <Text style={{ color: colors.text }}>←</Text>
        </Pressable>
      ) : (
        <View style={{ width: 40 }} />
      )}
      
      <Text style={{ fontSize: 18, fontWeight: "600", color: colors.text }}>{title}</Text>
      
      {rightAction || <View style={{ width: 40 }} />}
    </View>
  );
}
