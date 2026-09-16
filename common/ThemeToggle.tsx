import { Moon, Sun } from "lucide-react-native";
import { Pressable } from "react-native";
import { useTheme } from "./ThemeContext";

export default function ThemeToggle() {
  const { colors, darkMode, toggleDarkMode } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={darkMode ? "Activar modo claro" : "Activar modo oscuro"}
      onPress={toggleDarkMode}
      hitSlop={8}
      style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: colors.themeButton }}
    >
      {darkMode ? <Sun size={22} color="#facc15" /> : <Moon size={22} color={colors.text} />}
    </Pressable>
  );
}
