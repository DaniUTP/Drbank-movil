import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const [destination, setDestination] = useState<"/login" | "/dashboard" | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      AsyncStorage.getItem('remember_me'),
      AsyncStorage.getItem('access_token'),
      AsyncStorage.getItem('token_expiration'),
    ]).then(([rememberMe, token, tokenExpiration]) => {
      if (!active) return;
      
      if (rememberMe === 'true' && !!token) {
        if (tokenExpiration) {
          const expirationDate = new Date(tokenExpiration);
          const now = new Date();
          if (now >= expirationDate) {
            setDestination('/login');
          } else {
            setDestination('/dashboard');
          }
        } else {
          setDestination('/login');
        }
      } else {
        setDestination('/login');
      }
    }).catch(() => {
      if (active) setDestination('/login');
    });
    return () => { active = false; };
  }, []);

  if (!destination) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator /></View>;
  return <Redirect href={destination} />;
}
