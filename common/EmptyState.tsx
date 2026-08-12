import React, { memo } from "react";
import { Text, View } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { useTheme } from "./ThemeContext";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}

const EmptyState = memo<EmptyStateProps>(function EmptyState({
  icon: Icon,
  title,
  subtitle,
}) {
  const { colors } = useTheme();

  return (
    <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 48 }}>
      <Icon size={48} color={colors.subtitle} />
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600", marginTop: 16, textAlign: "center" }}>{title}</Text>
      {subtitle && <Text style={{ color: colors.subtitle, fontSize: 14, marginTop: 8, textAlign: "center" }}>{subtitle}</Text>}
    </View>
  );
});

EmptyState.displayName = "EmptyState";

export default EmptyState;
