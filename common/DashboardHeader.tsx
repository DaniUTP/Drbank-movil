import { Image } from "expo-image";
import { LogOut, Moon, Sun } from "lucide-react-native";
import { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useProfileQuery } from "../services/profile/profile.rtkq";
import { useTheme } from "./ThemeContext";

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
  const { colors, darkMode, toggleDarkMode } = useTheme();
  const { data: profileData, isLoading } = useProfileQuery();

  // Use API data or fallback to defaults
  const userName = isLoading ? "Cargando..." : (profileData?.name && profileData?.last_name) 
    ? `${profileData.name} ${profileData.last_name}` 
    : "Usuario";
  const userAvatar = "https://i.pravatar.cc/150?img=3"; // Default avatar since API doesn't provide one

  // Memoize styles to avoid recreation on each render
  const headerStyle = useMemo(() => [styles.header], []);
  const headerLeftStyle = useMemo(() => [styles.headerLeft], []);
  const avatarStyle = useMemo(() => [styles.avatar], []);
  const greetingStyle = useMemo(() => [styles.greeting, { color: colors.subtitle }], [colors.subtitle]);
  const usernameStyle = useMemo(() => [styles.username, { color: colors.text }], [colors.text]);
  const pageTitleStyle = useMemo(() => [styles.pageTitle, { color: colors.text }], [colors.text]);
  const pageSubtitleStyle = useMemo(() => [styles.pageSubtitle, { color: colors.subtitle }], [colors.subtitle]);
  const notificationStyle = useMemo(() => [styles.notification], []);

  return (
    <View style={headerStyle}>
      <View style={headerLeftStyle}>
        <Image 
          source={{ uri: userAvatar }} 
          style={avatarStyle}
          // Optimize image loading
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />

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
        <Pressable onPress={toggleDarkMode} style={notificationStyle}>
          {darkMode ? (
            <Sun size={22} color={colors.text} />
          ) : (
            <Moon size={22} color={colors.text} />
          )}
        </Pressable>
        
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
    borderRadius: 20
  },

  notification: {
    padding: 8
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
