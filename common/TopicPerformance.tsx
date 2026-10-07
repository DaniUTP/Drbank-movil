import { BookOpenCheck } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export type TopicPerformanceItem = {
  topicId?: string | number;
  topic: string;
  examType?: string;
  correct: boolean;
};

type TopicResult = {
  key: string;
  topic: string;
  examType?: string;
  correct: number;
  total: number;
  percentage: number;
};

export function buildTopicPerformance(items: TopicPerformanceItem[]): TopicResult[] {
  const grouped = new Map<string, { topic: string; examType?: string; correct: number; total: number }>();

  items.forEach(item => {
    const topic = item.topic.trim() || "Tema no especificado";
    const examType = item.examType?.trim() || undefined;
    const key = `${examType?.toLocaleLowerCase() ?? "general"}:name:${topic.toLocaleLowerCase()}`;
    const current = grouped.get(key) ?? { topic, examType, correct: 0, total: 0 };
    current.total += 1;
    if (item.correct) current.correct += 1;
    grouped.set(key, current);
  });

  return Array.from(grouped.entries()).map(([key, result]) => ({
    key,
    ...result,
    percentage: result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0,
  }));
}

export default function TopicPerformance({
  items,
  colors,
  darkMode,
  loading = false,
}: {
  items: TopicPerformanceItem[];
  colors: { card: string; text: string; subtitle: string; inputBorder: string };
  darkMode: boolean;
  loading?: boolean;
}) {
  const results = buildTopicPerformance(items);
  if (loading) {
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}>
        <View style={styles.header}>
          <View style={[styles.headerIcon, { backgroundColor: darkMode ? "#164e63" : "#e0f2fe" }]}>
            <BookOpenCheck size={19} color="#0284c7" />
          </View>
          <View style={styles.headerCopy}>
            <Text style={[styles.title, { color: colors.text }]}>Resultado por tema</Text>
            <Text style={[styles.subtitle, { color: colors.subtitle }]}>Porcentaje de respuestas correctas en cada tema</Text>
          </View>
        </View>
        <View style={styles.loadingState} accessibilityRole="progressbar" accessibilityLabel="Cargando resultados por tema">
          <ActivityIndicator size="small" color="#0284c7" />
          <Text style={[styles.loadingText, { color: colors.subtitle }]}>Cargando resultados por tema...</Text>
        </View>
      </View>
    );
  }
  if (!results.length) return null;
  const examGroups = Array.from(results.reduce((groups, result) => {
    const label = result.examType || "General";
    const values = groups.get(label) ?? [];
    values.push(result);
    groups.set(label, values);
    return groups;
  }, new Map<string, TopicResult[]>()));
  const showExamGroups = examGroups.length > 1 || examGroups[0]?.[0] !== "General";

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}>
      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: darkMode ? "#164e63" : "#e0f2fe" }]}>
          <BookOpenCheck size={19} color="#0284c7" />
        </View>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: colors.text }]}>Resultado por tema</Text>
          <Text style={[styles.subtitle, { color: colors.subtitle }]}>Porcentaje de respuestas correctas en cada tema</Text>
        </View>
      </View>

      <View style={styles.list}>
        {examGroups.map(([examType, groupResults]) => <View key={examType}>
          {showExamGroups && <Text style={[styles.examGroupTitle, { color: colors.text, borderTopColor: colors.inputBorder }]}>{examType}</Text>}
          {groupResults.map(result => {
            const accent = result.percentage > 65 ? "#16a34a" : result.percentage >= 60 ? "#d97706" : "#ef4444";
            return <View key={result.key} style={[styles.row, { borderTopColor: colors.inputBorder }]}> 
              <View style={styles.rowTop}>
                <Text style={[styles.topic, { color: colors.text }]}>{result.topic}</Text>
                <Text style={[styles.percentage, { color: accent }]}>{result.percentage}%</Text>
              </View>
              <View style={[styles.track, { backgroundColor: darkMode ? "#334155" : "#e2e8f0" }]}> 
                <View style={[styles.fill, { width: `${result.percentage}%`, backgroundColor: accent }]} />
              </View>
              <Text style={[styles.detail, { color: colors.subtitle }]}>{result.correct} de {result.total} correctas</Text>
            </View>;
          })}
        </View>)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 16, marginBottom: 24 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  headerIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  headerCopy: { flex: 1 },
  title: { fontSize: 16, fontWeight: "900" },
  subtitle: { fontSize: 11, lineHeight: 16, marginTop: 2 },
  list: { marginTop: 2 },
  loadingState: { minHeight: 110, alignItems: "center", justifyContent: "center", gap: 10, borderTopWidth: 1, borderTopColor: "#e2e8f0", marginTop: 10 },
  loadingText: { fontSize: 12, fontWeight: "700" },
  examGroupTitle: { borderTopWidth: 1, paddingTop: 14, marginTop: 12, fontSize: 12, fontWeight: "900", textTransform: "uppercase", letterSpacing: .5 },
  row: { borderTopWidth: 1, paddingTop: 14, marginTop: 12 },
  rowTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  topic: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: "800" },
  percentage: { fontSize: 17, fontWeight: "900" },
  track: { height: 8, borderRadius: 4, overflow: "hidden", marginTop: 10 },
  fill: { height: "100%", borderRadius: 4 },
  detail: { fontSize: 10, fontWeight: "700", marginTop: 6 },
});
