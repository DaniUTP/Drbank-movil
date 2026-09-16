import { useTheme } from "@/common/ThemeContext";
import { Tabs, usePathname, useRouter } from "expo-router";
import { BarChart3, Calendar, ChevronRight, FileText, Headphones, HeartPulse, Home, Layers, Plus, User, X } from "lucide-react-native";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const TAB_BAR_BASE_HEIGHT = 68;

// ============================================
// MEMOIZED MENU OPTIONS
// ============================================
interface MenuOptionProps {
  bgColor: string;
  iconBg: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>["colors"];
}

const MenuOption = memo(function MenuOption({
  bgColor,
  iconBg,
  icon,
  title,
  description,
  onPress,
  colors,
}: MenuOptionProps) {
  return (
    <TouchableOpacity
      style={[styles.menuOption, { backgroundColor: bgColor, borderColor: colors.inputBorder }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIconContainer, { backgroundColor: iconBg }]}>
        {icon}
      </View>
      <View style={styles.menuOptionContent}>
        <Text style={[styles.menuOptionTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.menuOptionDesc, { color: colors.subtitle }]}>
          {description}
        </Text>
      </View>
      <ChevronRight size={20} color={colors.subtitle} />
    </TouchableOpacity>
  );
});

// ============================================
// FLOATING MENU COMPONENT
// ============================================
type RouteType = "/calendar-detail" | "/history-exam" | "/support" | "/download-exams" | "/request-medical-assistance";

interface FloatingMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: RouteType) => void;
  colors: ReturnType<typeof useTheme>['colors'];
  darkMode: boolean;
  buttonTopY: number | null;
}

const FloatingMenu = memo(function FloatingMenu({
  isOpen,
  onClose,
  onNavigate,
  colors,
  darkMode,
  buttonTopY,
}: FloatingMenuProps) {
  const overlayRef = useRef<View>(null);
  const [buttonBottom, setButtonBottom] = useState<number | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (isOpen) {
      // Reset animations to start values before opening
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.3);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen, fadeAnim, scaleAnim]);

  const alignCloseButton = useCallback(() => {
    if (buttonTopY == null) return;
    overlayRef.current?.measureInWindow((_x, overlayY, _width, overlayHeight) => {
      setButtonBottom(overlayY + overlayHeight - buttonTopY - 56);
    });
  }, [buttonTopY]);

  useEffect(() => {
    if (isOpen) requestAnimationFrame(alignCloseButton);
  }, [isOpen, alignCloseButton]);

  const handleOptionPress = useCallback((option: string) => {
    onClose();
    switch (option) {
      case "support":
        onNavigate("/support");
        break;
      case "calendar":
        onNavigate("/history-exam");
        break;
      case "download":
        onNavigate("/download-exams");
        break;
      case "medical-assistance":
        onNavigate("/request-medical-assistance");
        break;
    }
  }, [onClose, onNavigate] as const);

  if (!isOpen) return null;

  return (
    <View ref={overlayRef} collapsable={false} style={styles.menuOverlay} onLayout={alignCloseButton}>
      <Animated.View style={[styles.menuBackdrop, { opacity: fadeAnim }]}>
        <Pressable style={styles.backdropPressable} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[styles.optionsMenu, {
        backgroundColor: colors.card,
        transform: [{ scale: scaleAnim }]
      }]}>
        <View style={[styles.menuHeader, { borderBottomColor: colors.inputBorder }]}>
          <Text style={[styles.menuTitle, { color: colors.text }]}>¿Qué deseas hacer?</Text>
        </View>

        <ScrollView
          style={styles.optionsScrollView}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.optionsList}>
            <MenuOption
              bgColor={darkMode ? "#102b28" : "#f0fdf4"}
              iconBg="#16a34a"
              icon={<Calendar size={24} color="white" />}
              title="Historial de exámenes"
              description="Revisa tus exámenes pasados"
              onPress={() => handleOptionPress("calendar")}
              colors={colors}
            />
            <MenuOption
              bgColor={darkMode ? "#112b45" : "#dbeafe"}
              iconBg="#0284c7"
              icon={<FileText size={24} color="white" />}
              title="Descarga de exámenes"
              description="Descarga exámenes para practicar"
              onPress={() => handleOptionPress("download")}
              colors={colors}
            />
            <MenuOption
              bgColor={darkMode ? "#342038" : "#fdf2f8"}
              iconBg="#db2777"
              icon={<Headphones size={24} color="white" />}
              title="Soporte"
              description="¿Necesitas ayuda?"
              onPress={() => handleOptionPress("support")}
              colors={colors}
            />
            <MenuOption
              bgColor={darkMode ? "#392126" : "#fff1f2"}
              iconBg="#dc2626"
              icon={<HeartPulse size={24} color="white" />}
              title="Solicitar asistencia médica"
              description="Contacta con nuestro equipo médico"
              onPress={() => handleOptionPress("medical-assistance")}
              colors={colors}
            />
          </View>
        </ScrollView>
      </Animated.View>

      <View style={[styles.closeButtonWrapper, { bottom: buttonBottom ?? 0, opacity: buttonBottom == null ? 0 : 1 }]}>
        <TouchableOpacity
          style={styles.closeButtonLarge}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <X size={28} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

// ============================================
// MAIN TAB LAYOUT CONTENT
// ============================================
function TabLayoutContent() {
  const { colors, darkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const addButtonRef = useRef<View>(null);
  const [buttonTopY, setButtonTopY] = useState<number | null>(null);
  const measureAddButton = useCallback(() => {
    addButtonRef.current?.measureInWindow((_x, y) => setButtonTopY(y));
  }, []);

  // Close menu when navigating away
  useEffect(() => {
    if (pathname !== '/add') {
      setIsAddOpen(false);
    }
  }, [pathname]);

  // Memoized navigation handler
  const handleNavigate = useCallback((route: RouteType) => {
    router.push(route as any);
  }, [router]);

  // Memoized close handler
  const handleCloseMenu = useCallback(() => {
    setIsAddOpen(false);
  }, []);

  // Toggle handler
  const handleToggleMenu = useCallback(() => {
    measureAddButton();
    setIsAddOpen(prev => !prev);
  }, [measureAddButton]);

  // Tab bar style options
  const tabBarStyle = useMemo(() => ({
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.inputBorder,
    paddingTop: 8,
    height: TAB_BAR_BASE_HEIGHT + insets.bottom,
    paddingBottom: Math.max(insets.bottom, 8),
    elevation: 0,
  }), [colors.card, colors.inputBorder, insets.bottom]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle,
          tabBarActiveTintColor: "#0284c7",
          tabBarInactiveTintColor: darkMode ? "#94a3b8" : "#64748b",
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 10,
            marginBottom: 2,
          },
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Inicio",
            tabBarIcon: ({ color }) => <Home size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="simulacre"
          options={{
            title: "Simulacro",
            tabBarIcon: ({ color }) => <Layers size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="add"
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              handleToggleMenu();
            },
          }}
          options={{
            title: "",
            tabBarIcon: () => (
              <View style={styles.addButtonContainer}>
                <View ref={addButtonRef} collapsable={false} onLayout={measureAddButton} style={styles.addButton}>
                  <Plus size={28} color="white" />
                </View>
              </View>
            ),
            tabBarLabel: () => null,
          }}
        />
        <Tabs.Screen
          name="performance"
          options={{
            title: "Rendimiento",
            tabBarIcon: ({ color }) => <BarChart3 size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Perfil",
            tabBarIcon: ({ color }) => <User size={22} color={color} />,
          }}
        />
      </Tabs>

      <FloatingMenu
        isOpen={isAddOpen}
        onClose={handleCloseMenu}
        onNavigate={handleNavigate}
        colors={colors}
        darkMode={darkMode}
        buttonTopY={buttonTopY}
      />
    </SafeAreaView>
  );
}

// ============================================
// WRAPPER - Provides SafeAreaProvider (required for SafeAreaView)
// Note: ThemeProvider is provided by root layout
// ============================================
function TabLayout() {
  return (
    <SafeAreaProvider>
      <TabLayoutContent />
    </SafeAreaProvider>
  );
}

export default TabLayout;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  addButtonContainer: {
    position: 'absolute',
    top: -25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: "#0284c7",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  backdropPressable: {
    flex: 1,
  },
  optionsMenu: {
    width: SCREEN_WIDTH - 32,
    maxWidth: 380,
    borderRadius: 24,
    padding: 0,
    marginBottom: 130,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  menuHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: 'center',
  },
  optionsScrollView: {
    maxHeight: Math.min(380, SCREEN_HEIGHT * 0.52),
    paddingHorizontal: 4,
    paddingBottom: 12,
  },
  scrollContentContainer: {
    overflow: 'hidden',
  },
  optionsList: {
    padding: 8,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuOptionContent: {
    flex: 1,
  },
  menuOptionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  menuOptionDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  closeHint: {
    textAlign: 'center',
    paddingVertical: 16,
    fontSize: 13,
  },
  closeButtonWrapper: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },
  closeButtonLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});
