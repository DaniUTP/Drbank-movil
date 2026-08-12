import { LucideIcon } from "lucide-react-native";
import React, { memo } from "react";
import { Text, View } from "react-native";
import { useTheme } from "./ThemeContext";

interface StatCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  value: string;
  label: string;
  colors?: any;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

const StatCard = memo<StatCardProps>(function StatCard({
  icon: Icon,
  iconColor,
  iconBgColor,
  value,
  label,
  colors: propColors,
  subtitle,
  trend,
  trendValue,
}) {
  const { colors: contextColors } = useTheme();
  const colors = propColors || contextColors;

  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16, alignItems: "center", flex: 1 }}>
      <View style={{ backgroundColor: iconBgColor, width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" }}>
        <Icon size={18} color={iconColor} />
      </View>
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700", marginTop: 8 }}>{value}</Text>
      <Text style={{ color: colors.subtitle, fontSize: 12, marginTop: 2 }}>{label}</Text>
      {subtitle && <Text style={{ color: colors.subtitle, fontSize: 10, marginTop: 2 }}>{subtitle}</Text>}
    </View>
  );
});

StatCard.displayName = "StatCard";

export default StatCard;
