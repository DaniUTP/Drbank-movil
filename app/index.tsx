import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const [destination, setDestination] = useState<"/login" | "/dashboard" | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      AsyncStorage.getItem('remember_me'),
      AsyncStorage.getItem('access_token'),
    ]).then(([rememberMe, token]) => {
      if (active) setDestination(rememberMe === 'true' && !!token ? '/dashboard' : '/login');
    }).catch(() => {
      if (active) setDestination('/login');
    });
    return () => { active = false; };
  }, []);

  if (!destination) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator /></View>;
  return <Redirect href={destination} />;
}
