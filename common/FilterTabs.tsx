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
            backgroundColor: activeTab === tab.key ? colors.buttonBg : colors.card,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            marginRight: 8,
          }}
        >
          <Text
            style={{
              color: activeTab === tab.key ? colors.buttonText : colors.subtitle,
              fontSize: 14,
              fontWeight: activeTab === tab.key ? "600" : "400",
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
