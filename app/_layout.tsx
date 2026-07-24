import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { ThemeProvider } from "../components/ThemeContext";
import { store } from "../store";

// ============================================
// ROOT LAYOUT - Main entry point
// Wraps entire app with ThemeProvider and Redux Provider
// With autohide in app.json, splash will hide automatically
// ============================================
function RootLayoutComponent() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            // Disable all animations for instant transitions
            animation: 'none',
            // Prevent white flash - same background as splash
            contentStyle: { backgroundColor: '#f8fafc' },
          }}
        />
      </ThemeProvider>
    </Provider>
  );
}

export default RootLayoutComponent;
