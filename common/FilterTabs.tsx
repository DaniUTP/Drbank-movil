import React, { memo } from "react";
import { Pressable, ScrollView, Text } from "react-native";
import { useTheme } from "./ThemeContext";

interface FilterTab {
  key: string;
  label: string;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

const FilterTabs = memo<FilterTabsProps>(function FilterTabs({
  tabs,
  activeTab,
  onTabChange,
}) {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ paddingHorizontal: 16, marginTop: 16 }}
      contentContainerStyle={{ paddingRight: 16 }}
    >
      {tabs.map((tab) => (
        <Pressable
          key={tab.key}
          onPress={() => onTabChange(tab.key)}
          style={{
            backgroundColor: activeTab === tab.key ? "#0284c7" : colors.card,
            paddingHorizontal: 18,
            paddingVertical: 10,
            borderRadius: 22,
            marginRight: 8,
            borderWidth: activeTab === tab.key ? 0 : 1,
            borderColor: colors.inputBorder || "#e2e8f0",
            shadowColor: activeTab === tab.key ? "#0284c7" : "transparent",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: activeTab === tab.key ? 0.2 : 0,
            shadowRadius: 4,
            elevation: activeTab === tab.key ? 3 : 0,
          }}
        >
          <Text
            style={{
              color: activeTab === tab.key ? "#ffffff" : colors.subtitle,
              fontSize: 13,
              fontWeight: activeTab === tab.key ? "700" : "500",
              letterSpacing: -0.2,
            }}
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
});

FilterTabs.displayName = "FilterTabs";

export default FilterTabs;
