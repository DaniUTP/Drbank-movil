import { useTheme } from "@/components/ThemeContext";
import { Image } from "expo-image";
import { Moon, Sun } from "lucide-react-native";
import { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

// Memoized user data to prevent recreation on each render
const USER_DATA = {
  name: "Juan Carlos",
  avatar: "https://i.pravatar.cc/150?img=3"
} as const;

// Memoized to prevent unnecessary re-renders
const DashboardHeaderComponent = memo(function DashboardHeader({ 
  title, 
  subtitle 
}: DashboardHeaderProps) {
  const { colors, darkMode, toggleDarkMode } = useTheme();

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
          source={{ uri: USER_DATA.avatar }} 
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
                {USER_DATA.name}
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

      <Pressable onPress={toggleDarkMode} style={notificationStyle}>
        {darkMode ? (
          <Sun size={22} color={colors.text} />
        ) : (
          <Moon size={22} color={colors.text} />
        )}
      </Pressable>
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
