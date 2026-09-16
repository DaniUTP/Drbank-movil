import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "./ThemeContext";

interface TabItem {
  id: string;
  label: string;
}

interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

const TabNavigation = memo<TabNavigationProps>(function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
}) {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: "row", backgroundColor: colors.card, paddingHorizontal: 4, paddingVertical: 4, borderRadius: 12, marginHorizontal: 16, marginTop: 16 }}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.id}
          onPress={() => onTabChange(tab.id)}
          style={{
            flex: 1,
            paddingVertical: 10,
            paddingHorizontal: 2,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            backgroundColor: activeTab === tab.id ? colors.buttonBg : "transparent",
          }}
        >
          <Text
            style={{
              color: activeTab === tab.id ? colors.buttonText : colors.subtitle,
              fontSize: 12,
              fontWeight: activeTab === tab.id ? "600" : "400",
              textAlign: "center",
              flexShrink: 1,
            }}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
});

TabNavigation.displayName = "TabNavigation";

export default TabNavigation;
