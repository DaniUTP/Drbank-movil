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

// Lazy load the SimulacreGeneratorByYear screen
const SimulacreGeneratorByYearScreen = React.lazy(() => import('@/screens/SimulacreGeneratorByYear'));

export default function SimulacreGeneratorByYearRoute() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SimulacreGeneratorByYearScreen />
    </Suspense>
  );
}