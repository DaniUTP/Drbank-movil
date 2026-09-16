import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { Provider } from "react-redux";
import Modal from "../common/Modal";
import { ThemeProvider, useTheme } from "../common/ThemeContext";
import {
  getFCMToken,
  requestUserPermission,
  setupMessageListener,
} from "../FirebaseConfig";
import type { ForegroundNotification } from "../FirebaseConfig";
import { store } from "../store";
import { AuthorizationStatus } from "@react-native-firebase/messaging";

function NotificationManager() {
  const pathname = usePathname();
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState<ForegroundNotification[]>([]);
  const isTakingExam = pathname === "/questions";
  const currentNotification = notifications[0];

  const enqueueNotification = useCallback((notification: ForegroundNotification) => {
    setNotifications((current) => [...current, notification]);
  }, []);

  const closeNotification = useCallback(() => {
    setNotifications((current) => current.slice(1));
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let active = true;

    const initializeNotifications = async () => {
      try {
        const authStatus = await requestUserPermission();
        const isAuthorized = authStatus === AuthorizationStatus.AUTHORIZED
          || authStatus === AuthorizationStatus.PROVISIONAL;

        if (!active || !isAuthorized) return;

        await getFCMToken();
        if (active) unsubscribe = setupMessageListener(enqueueNotification);
      } catch (error) {
        console.error("Error configuring FCM:", error);
      }
    };

    void initializeNotifications();

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [enqueueNotification]);

  return (
    <Modal
      visible={Boolean(currentNotification) && !isTakingExam}
      onClose={closeNotification}
      title={currentNotification?.title ?? "Notificación"}
      logoSource={require("../assets/logo_app.png")}
      logoStyle={styles.notificationLogo}
      footerText="Aceptar"
    >
      <Text style={[styles.notificationMessage, { color: colors.text }]}>
        {currentNotification?.message}
      </Text>
    </Modal>
  );
}

const styles = StyleSheet.create({
  notificationLogo: {
    width: 180,
    height: 58,
    marginBottom: 14,
  },
  notificationMessage: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
});

function AppContent() {
  const { colors, darkMode } = useTheme();
  return (
    <>
      <StatusBar style={darkMode ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          // Disable all animations for instant transitions
          animation: 'none',
          // Prevent white flash - same background as splash
          contentStyle: { backgroundColor: colors.background },
        }}
      />
      <NotificationManager />
    </>
  );
}

function RootLayoutComponent() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}

export default RootLayoutComponent;
