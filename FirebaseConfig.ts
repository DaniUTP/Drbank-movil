// React Native Firebase SDK - Modular API (v22+)
import { getApp } from '@react-native-firebase/app';
import { AuthorizationStatus, getMessaging, getToken, onMessage, requestPermission, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { Alert, PermissionsAndroid, Platform } from 'react-native';

// Get messaging instance using modular API
const app = getApp();
const messaging = getMessaging(app);

// Background message handler - Firebase maneja automáticamente las notificaciones en background/quit
setBackgroundMessageHandler(messaging, async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  // Firebase mostrará automáticamente la notificación si tiene payload de notification
});

// Request notification permissions
export async function requestUserPermission(): Promise<number> {
  // Para Android 13+, solicitar permiso POST_NOTIFICATIONS
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Permission denied for POST_NOTIFICATIONS');
      return AuthorizationStatus.DENIED;
    }
    console.log('POST_NOTIFICATIONS permission granted');
  }

  // Solicitar permiso de Firebase Messaging
  console.log('Requesting FCM notification permission...');
  const authStatus = await requestPermission(messaging);
  console.log('Permission request result:', authStatus);

  if (authStatus === AuthorizationStatus.AUTHORIZED || authStatus === AuthorizationStatus.PROVISIONAL) {
    console.log('Authorization status:', authStatus);
  } else {
    console.log('Permission denied:', authStatus);
  }
  return authStatus;
}

// Get FCM token
export async function getFCMToken() {
  try {
    const token = await getToken(messaging);
    if (token) {
      console.log('FCM Token:', token);
      return token;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
  return null;
}

// Listen for incoming messages - Using modular API
export function setupMessageListener() {
  const unsubscribe = onMessage(messaging, async remoteMessage => {
    console.log('Received FCM message:', remoteMessage);

    // Display local notification when app is in foreground
    console.log('Notification data:', remoteMessage);

    Alert.alert(
      remoteMessage.notification?.title || 'Notificación',
      remoteMessage.notification?.body || 'Tienes un nuevo mensaje'
    );
  });
  return unsubscribe;
}