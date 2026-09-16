import { LogOut } from "lucide-react-native";
import { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useProfileQuery } from "../services/profile/profile.rtkq";
import { useTheme } from "./ThemeContext";
import ThemeToggle from "./ThemeToggle";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  onLogout?: () => void;
}

// Memoized to prevent unnecessary re-renders
const DashboardHeaderComponent = memo(function DashboardHeader({ 
  title, 
  subtitle,
  onLogout
}: DashboardHeaderProps) {
  const { colors } = useTheme();
  const { data: profileData, isLoading } = useProfileQuery();

  // Use API data or fallback to defaults
  const userName = isLoading ? "Cargando..." : (profileData?.name && profileData?.last_name) 
    ? `${profileData.name} ${profileData.last_name}` 
    : "Usuario";
  const userInitials = useMemo(() => {
    if (isLoading) return "";

    const firstInitial = profileData?.name?.trim().charAt(0) ?? "";
    const lastInitial = profileData?.last_name?.trim().charAt(0) ?? "";

    return `${firstInitial}${lastInitial}`.toUpperCase() || "U";
  }, [isLoading, profileData?.last_name, profileData?.name]);

  // Memoize styles to avoid recreation on each render
  const headerStyle = useMemo(() => [styles.header], []);
  const headerLeftStyle = useMemo(() => [styles.headerLeft], []);
  const greetingStyle = useMemo(() => [styles.greeting, { color: colors.subtitle }], [colors.subtitle]);
  const usernameStyle = useMemo(() => [styles.username, { color: colors.text }], [colors.text]);
  const pageTitleStyle = useMemo(() => [styles.pageTitle, { color: colors.text }], [colors.text]);
  const pageSubtitleStyle = useMemo(() => [styles.pageSubtitle, { color: colors.subtitle }], [colors.subtitle]);
  const notificationStyle = useMemo(() => [styles.notification, { backgroundColor: colors.themeButton }], [colors.themeButton]);

  return (
    <View style={headerStyle}>
      <View style={headerLeftStyle}>
        <View style={styles.avatar} accessibilityLabel={`Iniciales del estudiante: ${userInitials || "cargando"}`}>
          <Text style={styles.avatarText}>{userInitials}</Text>
        </View>

        <View>
          {title !== "hide" && (
            <>
              <Text style={greetingStyle}>
                Buenos días,
              </Text>

              <Text style={usernameStyle}>
                {userName}
              </Text>
            </>
          )}
          
          {title && title !== "hide" && (
            <Text style={pageTitleStyle}>
              {title}
            </Text>
          )}
          
          {subtitle && (
            <Text style={pageSubtitleStyle}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.headerRight}>
        <ThemeToggle />
        
        {onLogout && (
          <Pressable onPress={onLogout} style={notificationStyle}>
            <LogOut size={22} color="#ef4444" />
          </Pressable>
        )}
      </View>
    </View>
  );
});

// Add displayName for debugging
export default DashboardHeaderComponent;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0284c7"
  },

  avatarText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.4
  },

  notification: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  greeting: {
    fontSize: 14
  },

  username: {
    fontSize: 20,
    fontWeight: "bold"
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 5
  },

  pageSubtitle: {
    fontSize: 14,
    marginTop: 2
  },
});
