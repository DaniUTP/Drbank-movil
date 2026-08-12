import React, { memo } from "react";
import { Pressable, TextInput, View } from "react-native";
import { Search, X } from "lucide-react-native";
import { useTheme } from "./ThemeContext";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

const SearchBar = memo<SearchBarProps>(function SearchBar({
  value,
  onChangeText,
  placeholder = "Buscar...",
  onClear,
}) {
  const { colors } = useTheme();

  const handleClear = () => {
    onChangeText("");
    onClear?.();
  };

  return (
    <View style={{ backgroundColor: colors.card, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, marginHorizontal: 16, marginTop: 16 }}>
      <Search size={18} color={colors.subtitle} />
      <TextInput
        style={{ flex: 1, marginLeft: 8, color: colors.text, fontSize: 14 }}
        placeholder={placeholder}
        placeholderTextColor={colors.subtitle}
        value={value}
        onChangeText={onChangeText}
      />
      {value.length > 0 && (
        <Pressable onPress={handleClear} style={{ padding: 4 }}>
          <X size={18} color={colors.subtitle} />
        </Pressable>
      )}
    </View>
  );
});

SearchBar.displayName = "SearchBar";

export default SearchBar;
