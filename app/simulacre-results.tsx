import React, { Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';

// Loading component for lazy loaded screens
function LoadingFallback() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#0284c7" />
    </View>
  );
}

// Lazy load the SimulacreResults screen
const SimulacreResultsScreen = React.lazy(() => import('../screens/SimulacreResults'));

export default function SimulacreResultsRoute() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SimulacreResultsScreen />
    </Suspense>
  );
}
