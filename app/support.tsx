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

// Lazy load the Support screen
const SupportScreen = React.lazy(() => import('@/screens/Support'));

export default function SupportRoute() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SupportScreen />
    </Suspense>
  );
}
