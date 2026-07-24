import { useTheme } from "@/components/ThemeContext";
import { Tabs, usePathname, useRouter } from "expo-router";
import { BarChart3, Calendar, ChevronRight, FileText, Headphones, Home, Layers, MessageCircle, Plus, User, X } from "lucide-react-native";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
}

const MenuOption = memo(function MenuOption({
  bgColor,
  iconBg,
  icon,
  title,
  description,
  onPress,
}: MenuOptionProps) {
  return (
    <TouchableOpacity
      style={[styles.menuOption, { backgroundColor: bgColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIconContainer, { backgroundColor: iconBg }]}>
        {icon}
      </View>
      <View style={styles.menuOptionContent}>
        <Text style={[styles.menuOptionTitle, { color: "#0f172a" }]}>
          {title}
        </Text>
        <Text style={[styles.menuOptionDesc, { color: "#64748b" }]}>
          {description}
        </Text>
      </View>
      <ChevronRight size={20} color="#94a3b8" />
    </TouchableOpacity>
  );
});

// ============================================
// FLOATING MENU COMPONENT
// ============================================
type RouteType = "/chat-agent" | "/simulacre-generator" | "/calendar-detail" | "/historial-exam" | "/support" | "/simulacro-personalizado";

interface FloatingMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: RouteType) => void;
  colors: ReturnType<typeof useTheme>['colors'];
}

const FloatingMenu = memo(function FloatingMenu({
  isOpen,
  onClose,
  onNavigate,
  colors,
}: FloatingMenuProps) {
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

  const handleOptionPress = useCallback((option: string) => {
    onClose();
    switch (option) {
      case "chat":
        onNavigate("/chat-agent");
        break;
      case "support":
        onNavigate("/support");
        break;
      case "simulacre":
        onNavigate("/simulacro-personalizado");
        break;
      case "calendar":
        onNavigate("/historial-exam");
        break;
    }
  }, [onClose, onNavigate] as const);

  if (!isOpen) return null;

  return (
    <View style={styles.menuOverlay}>
      <Animated.View style={[styles.menuBackdrop, { opacity: fadeAnim }]}>
        <Pressable style={styles.backdropPressable} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[styles.optionsMenu, {
        backgroundColor: colors.card,
        transform: [{ scale: scaleAnim }]
      }]}>
        <View style={styles.menuHeader}>
          <Text style={[styles.menuTitle, { color: colors.text }]}>¿Qué deseas hacer?</Text>
        </View>

        <ScrollView
          style={styles.optionsScrollView}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.optionsList}>
            <MenuOption
              bgColor="#e0e7ff"
              iconBg="#4f46e5"
              icon={<MessageCircle size={24} color="white" />}
              title="Chatea con Drbankito"
              description="Resuelve tus dudas con IA"
              onPress={() => handleOptionPress("chat")}
            />
            <MenuOption
              bgColor="#f0fdf4"
              iconBg="#16a34a"
              icon={<Calendar size={24} color="white" />}
              title="Historial de exámenes"
              description="Revisa tus exámenes pasados"
              onPress={() => handleOptionPress("calendar")}
            />
            <MenuOption
              bgColor="#fdf2f8"
              iconBg="#db2777"
              icon={<Headphones size={24} color="white" />}
              title="Soporte"
              description="¿Necesitas ayuda?"
              onPress={() => handleOptionPress("support")}
            />
            <MenuOption
              bgColor="#f0f9ff"
              iconBg="#0284c7"
              icon={<FileText size={24} color="white" />}
              title="Genera simulacro por Drbankito"
              description="Crea un simulacro inteligente"
              onPress={() => handleOptionPress("simulacre")}
            />
          </View>
        </ScrollView>
      </Animated.View>

      <View style={styles.closeButtonWrapper}>
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
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [isAddOpen, setIsAddOpen] = useState(false);

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
    setIsAddOpen(prev => !prev);
  }, []);

  // Tab bar style options
  const tabBarStyle = useMemo(() => ({
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    height: 65,
    paddingBottom: 15,
    paddingTop: 8,
    marginBottom: 35,
    elevation: 0,
  }), [colors.card]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#ffffff' }]} edges={['left', 'right']}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle,
          tabBarActiveTintColor: "#0284c7",
          tabBarInactiveTintColor: "#64748b",
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 11,
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
                <View style={styles.addButton}>
                  <Plus size={28} color="white" />
                </View>
              </View>
            ),
            tabBarLabel: () => null,
          }}
        />
        <Tabs.Screen
          name="metric"
          options={{
            title: "Métricas",
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
    maxHeight: 300,
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
    bottom: 55,
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
