import Modal from "@/common/Modal";
import type { ThemeColors } from "@/common/ThemeContext";
import { useTheme } from "@/common/ThemeContext";
import { Image } from "expo-image";
import { Slot, usePathname, useRouter, useSegments } from "expo-router";
import { Moon, Sun } from "lucide-react-native";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ============================================
// MEMOIZED HEADER COMPONENT
// ============================================
const AuthHeader = memo(function AuthHeader({
  darkMode,
  toggleDarkMode,
  colors,
}: {
  darkMode: boolean;
  toggleDarkMode: () => void;
  colors: ThemeColors;
}) {
  return (
    <View style={styles.header}>
      <Image
        source={require("@/assets/logo_app.png")}
        style={styles.logo}
        contentFit="contain"
        transition={0}
        cachePolicy="memory-disk"
      />
      <Pressable
        style={[styles.themeButton, { backgroundColor: colors.themeButton }]}
        onPress={toggleDarkMode}
        hitSlop={8}
      >
        {darkMode ? (
          <Sun size={20} color="#facc15" />
        ) : (
          <Moon size={20} color="#0f172a" />
        )}
      </Pressable>
    </View>
  );
});

// ============================================
// TABS COMPONENT
// ============================================
function AuthTabs({
  activeTab,
  colors,
  onLoginPress,
  onRegisterPress,
}: {
  activeTab: string;
  colors: ThemeColors;
  onLoginPress: () => void;
  onRegisterPress: () => void;
}) {
  console.log("AuthTabs activeTab:", activeTab);
  const isLoginActive = activeTab === "login";
  const isRegisterActive = activeTab === "register";
  console.log("AuthTabs isLoginActive:", isLoginActive);
  console.log("AuthTabs isRegisterActive:", isRegisterActive);
  console.log("AuthTabs tabActive color:", colors.tabActive);
  console.log("AuthTabs tabsBackground color:", colors.tabsBackground);

  return (
    <View style={[styles.tabs, { backgroundColor: colors.tabsBackground }]}>
      <Pressable
        key="login-tab"
        style={[
          styles.tabBtn,
          { backgroundColor: isLoginActive ? colors.tabActive : colors.tabsBackground },
        ]}
        onPress={onLoginPress}
        android_ripple={{ color: colors.tabsBackground }}
        hitSlop={8}
      >
        <Text
          style={[
            styles.tabText,
            { color: colors.text },
            isLoginActive && { color: colors.tabTextActive },
          ]}
        >
          Iniciar Sesión
        </Text>
      </Pressable>

      <Pressable
        key="register-tab"
        style={[
          styles.tabBtn,
          { backgroundColor: isRegisterActive ? colors.tabActive : colors.tabsBackground },
        ]}
        onPress={onRegisterPress}
        android_ripple={{ color: colors.tabsBackground }}
        hitSlop={8}
      >
        <Text
          style={[
            styles.tabText,
            { color: colors.text },
            isRegisterActive && { color: colors.tabTextActive },
          ]}
        >
          Registrarse
        </Text>
      </Pressable>
    </View>
  );
};

// ============================================
// BEAUTIFUL WELCOME LOADING COMPONENT
// Shows animated welcome while form loads - WOW effect!
// ============================================
const WelcomeLoading = memo<{ colors: ThemeColors }>(function WelcomeLoading({ colors }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Fade in and slide up animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation for the brand
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim, fadeAnim, translateY]);

  return (
    <Animated.View 
      style={[
        styles.welcomeContainer, 
        { opacity: fadeAnim, transform: [{ translateY }] }
      ]}
    >
      <Animated.Text
        style={[
          styles.welcomeTitle,
          { color: colors.subtitle },
        ]}
      >
        Bienvenido a
      </Animated.Text>
      <Animated.Text
        style={[
          styles.welcomeBrand,
          { color: colors.buttonBg, transform: [{ scale: pulseAnim }] },
        ]}
      >
        DrBank
      </Animated.Text>
      <Text style={[styles.welcomeSubtitle, { color: colors.subtitle }]}>
        Banco de preguntas de medicina humana del Perú
      </Text>
      
      {/* Animated loading dots */}
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map((index) => (
          <AnimatedDot key={index} index={index} color={colors.buttonBg} />
        ))}
      </View>
    </Animated.View>
  );
});

// ============================================
// ANIMATED DOT COMPONENT
// ============================================
const AnimatedDot = memo(function AnimatedDot({ 
  index, 
  color 
}: { 
  index: number; 
  color: string 
}) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const delay = index * 200;
    
    const animate = () => {
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.3,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(animate);
    };

    const timer = setTimeout(animate, delay);
    return () => clearTimeout(timer);
  }, [anim, index]);

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: color },
        { opacity: anim },
      ]}
    />
  );
});

// ============================================
// AUTH MODAL COMPONENT
// ============================================
function AuthModal() {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalLogoSource, setModalLogoSource] = useState<any>(null);
  const [onModalClose, setOnModalClose] = useState<(() => void) | null>(null);

  // Expose modal functions globally via window
  useEffect(() => {
    (global as any).showAuthModal = (title: string, message: string, logoSource?: any, onClose?: () => void) => {
      // Use setTimeout to avoid setState during render
      setTimeout(() => {
        setModalTitle(title);
        setModalMessage(message);
        setModalLogoSource(logoSource || null);
        setOnModalClose(onClose || null);
        setModalVisible(true);
      }, 0);
    };
    (global as any).hideAuthModal = () => {
      setModalVisible(false);
    };
  }, []);

  const handleClose = () => {
    setModalVisible(false);
    if (onModalClose) {
      onModalClose();
    }
  };

  return (
    <Modal
      visible={modalVisible}
      onClose={handleClose}
      title={modalTitle}
      logoSource={modalLogoSource}
    >
      <Text style={{ color: colors.text, fontSize: 16, textAlign: "center", lineHeight: 24 }}>
        {modalMessage}
      </Text>
    </Modal>
  );
}

// ============================================
// MAIN LAYOUT CONTENT
// ============================================
function LayoutContent() {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const activeTab = segments[segments.length - 1];
  console.log("Segments:", segments);
  console.log("Active tab:", activeTab);
  const { darkMode, toggleDarkMode, colors } = useTheme();

  // Memoize navigation handlers - use replace for tab navigation
  const handleLoginPress = useCallback(() => {
    console.log("Navigating to login");
    router.replace("/login");
  }, [router]);

  const handleRegisterPress = useCallback(() => {
    console.log("Navigating to register");
    router.replace("/register");
  }, [router]);

  // Show content immediately - no loading screen to avoid blank screen
  // Content loads normally without blocking

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <AuthHeader
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        colors={colors}
      />

      {/* Card with tabs and form */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <AuthTabs
          key={`${activeTab}-${darkMode}`}
          activeTab={activeTab}
          colors={colors}
          onLoginPress={handleLoginPress}
          onRegisterPress={handleRegisterPress}
        />
        <View style={styles.slotContainer}>
          <Slot />
        </View>
      </View>

      {/* Auth Modal */}
      <AuthModal />
    </SafeAreaView>
  );
}

// Export the layout content
export default LayoutContent;

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  header: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 40,
    resizeMode: "contain",
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    flex: 1,
    marginTop: 24,
    borderRadius: 30,
    padding: 25,
    minHeight: 0,
  },
  slotContainer: {
    flex: 1,
    minHeight: 0,
  },
  tabs: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 5,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderRadius: 15,
  },
  tabText: {
    fontWeight: "600",
  },
  // Welcome loading styles
  welcomeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 4,
  },
  welcomeBrand: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  dotsContainer: {
    flexDirection: "row",
    marginTop: 30,
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
