import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

export default function Index() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // Delay Firebase initialization to avoid crash on startup
    const initializeApp = async () => {
      try {
        // Import Firebase dynamically to avoid initialization issues
        const FirebaseConfig = await import("../FirebaseConfig");
        const { requestUserPermission, getFCMToken, setupMessageListener } = FirebaseConfig;
        const { AuthorizationStatus } = await import("@react-native-firebase/messaging");

        const authStatus = await requestUserPermission();

        if (authStatus === AuthorizationStatus.AUTHORIZED || authStatus === AuthorizationStatus.PROVISIONAL) {
          console.log("Notification permissions granted");

          const token = await getFCMToken();
          if (token) {
            console.log("FCM Token obtained:", token);
          }

          unsubscribe = setupMessageListener();
        } else {
          console.log("Notification permissions denied");
        }
      } catch (error) {
        console.error("Error configuring FCM:", error);
      } finally {
        setIsReady(true);
      }
    };

    // Small delay to ensure app is fully loaded
    const timer = setTimeout(() => {
      initializeApp();
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  if (!isReady) {
    return null;
  }

  return <Redirect href="/login" />;
}
