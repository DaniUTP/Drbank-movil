import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

export default function Index() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // Retrasar la inicialización de Firebase para evitar crash al inicio
    const initializeApp = async () => {
      try {
        // Importar Firebase dinámicamente para evitar problemas de inicialización
        const FirebaseConfig = await import("../FirebaseConfig");
        const { requestUserPermission, getFCMToken, setupMessageListener } = FirebaseConfig;
        const { AuthorizationStatus } = await import("@react-native-firebase/messaging");

        const authStatus = await requestUserPermission();

        if (authStatus === AuthorizationStatus.AUTHORIZED || authStatus === AuthorizationStatus.PROVISIONAL) {
          console.log("Permisos de notificación concedidos");

          const token = await getFCMToken();
          if (token) {
            console.log("FCM Token obtenido:", token);
          }

          unsubscribe = setupMessageListener();
        } else {
          console.log("Permisos de notificación denegados");
        }
      } catch (error) {
        console.error("Error configurando FCM:", error);
      } finally {
        setIsReady(true);
      }
    };

    // Pequeño retraso para asegurar que la app esté completamente cargada
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
