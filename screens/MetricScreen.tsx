import { useRouter } from "expo-router";
import React, { memo, useCallback, useMemo, useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { useTheme } from "../components/ThemeContext";

import {
    ArrowLeft,
    BookOpen,
    Brain,
    Clock,
    Eye,
    Heart,
    LayoutGrid,
    Moon,
    Pill,
    Scale,
    Sun,
    TrendingDown,
    TrendingUp,
    X
} from "lucide-react-native";

interface StatCardProps {
    icon: React.ElementType;
    iconColor: string;
    iconBgColor: string;
    title: string;
    value: string;
    subtitle?: string;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
}

function StatCard({ icon: Icon, iconColor, iconBgColor, title, value, subtitle, trend, trendValue }: StatCardProps) {
    const { colors } = useTheme();
    
    return (
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIconContainer, { backgroundColor: iconBgColor }]}>
                <Icon size={22} color={iconColor} />
            </View>
            <Text style={[styles.statTitle, { color: colors.subtitle }]}>{title}</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
            {subtitle && <Text style={[styles.statSubtitle, { color: colors.subtitle }]}>{subtitle}</Text>}
            {trend && trendValue && (
                <View style={styles.trendContainer}>
                    {trend === "up" && <TrendingUp size={14} color="#22c55e" />}
                    {trend === "down" && <TrendingDown size={14} color="#ef4444" />}
                    <Text style={[styles.trendText, { color: trend === "up" ? "#22c55e" : trend === "down" ? "#ef4444" : "#64748b" }]}>
                        {trendValue}
                    </Text>
                </View>
            )}
        </View>
    );
}

// Memoized HeatMap component to prevent expensive recalculations
const HeatMapMonth = memo(function HeatMapMonth() {
    const { colors } = useTheme();
    
    // Memoize date calculations - only recalculate on month change
    const today = useMemo(() => new Date(), []);
    const daysInMonth = useMemo(() => new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate(), [today]);
    const firstDayOfMonth = useMemo(() => new Date(today.getFullYear(), today.getMonth(), 1).getDay(), [today]);
    
    // Memoize study data - only recalculate when month changes
    const studyData = useMemo(() => 
        Array.from({ length: daysInMonth }, () => Math.floor(Math.random() * 5)),
        [daysInMonth]
    );

    // Memoize color function
    const getColor = useCallback((level: number) => {
        switch(level) {
            case 0: return colors.subtitle + "15";
            case 1: return "#22c55e25";
            case 2: return "#22c55e50";
            case 3: return "#22c55e75";
            case 4: return "#22c55e";
            default: return colors.subtitle + "15";
        }
    }, [colors.subtitle]);

    const weekDays = ["D", "L", "M", "X", "J", "V", "S"];
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    // Memoize header styles
    const headerStyle = useMemo(() => [styles.heatMapHeader], []);
    const titleStyle = useMemo(() => [styles.heatMapTitle, { color: colors.text }], [colors.text]);
    const legendStyle = useMemo(() => [styles.heatMapLegend], []);
    const legendTextStyle = useMemo(() => [styles.heatMapLegendText, { color: colors.subtitle }], [colors.subtitle]);
    const weekDaysStyle = useMemo(() => [styles.weekDaysRow], []);
    const weekDayTextStyle = useMemo(() => [styles.weekDayText, { color: colors.subtitle }], [colors.subtitle]);
    const weeksContainerStyle = useMemo(() => [styles.weeksContainer], []);

    return (
        <View style={styles.heatMapContainer}>
            <View style={headerStyle}>
                <Text style={titleStyle}>
                    {monthNames[today.getMonth()]} {today.getFullYear()}
                </Text>
                <View style={legendStyle}>
                    <Text style={legendTextStyle}>Menos</Text>
                    {[0, 1, 2, 3, 4].map((level) => (
                        <View key={level} style={[styles.legendBox, { backgroundColor: getColor(level) }]} />
                    ))}
                    <Text style={legendTextStyle}>Más</Text>
                </View>
            </View>
            <View style={weekDaysStyle}>
                {weekDays.map((day, i) => (
                    <Text key={i} style={weekDayTextStyle}>{day}</Text>
                ))}
            </View>
            <View style={weeksContainerStyle}>
                {Array.from({ length: Math.ceil((firstDayOfMonth + daysInMonth) / 7) }).map((_, weekIndex) => (
                    <View key={weekIndex} style={styles.weekRow}>
                        {Array.from({ length: 7 }).map((_, dayIndex) => {
                            const dayNumber = weekIndex * 7 + dayIndex - firstDayOfMonth + 1;
                            if (dayNumber < 1 || dayNumber > daysInMonth) {
                                return <View key={dayIndex} style={styles.heatMapCell} />;
                            }
                            const level = studyData[dayNumber - 1];
                            return (
                                <View 
                                    key={dayIndex} 
                                    style={[
                                        styles.heatMapCell, 
                                        { backgroundColor: getColor(level) },
                                        dayNumber === today.getDate() && { borderWidth: 2, borderColor: "#0284c7" }
                                    ]} 
                                >
                                    <Text style={[
                                        styles.heatMapDayText, 
                                        { color: level >= 3 ? "#ffffff" : colors.text }
                                    ]}>
                                        {dayNumber}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                ))}
            </View>
        </View>
    );
});

export default function MetricScreen() {
    const { colors, darkMode, toggleDarkMode } = useTheme();
    const router = useRouter();
    const [showTopicsModal, setShowTopicsModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    const overallStats = {
        streak: 12,
        totalQuestions: 2847,
        examsTaken: 45,
        averageScore: 78,
        totalTime: "156h 30m",
        perfectScores: 8,
        rank: 156,
        totalUsers: 2847,
    };

    const topicPerformance = [
        { name: "Cardiología", icon: Heart, iconColor: "#ef4444", progress: 85, questions: 320, correct: 272 },
        { name: "Pediatría", icon: Brain, iconColor: "#8b5cf6", progress: 72, questions: 280, correct: 202 },
        { name: "Farmacología", icon: Pill, iconColor: "#f97316", progress: 68, questions: 240, correct: 163 },
        { name: "Neurología", icon: Brain, iconColor: "#06b6d4", progress: 55, questions: 180, correct: 99 },
        { name: "Cirugía General", icon: Scale, iconColor: "#ec4899", progress: 48, questions: 210, correct: 101 },
        { name: "Medicina Interna", icon: Heart, iconColor: "#14b8a6", progress: 62, questions: 195, correct: 121 },
        { name: "Ginecología", icon: Heart, iconColor: "#f43f5e", progress: 71, questions: 165, correct: 117 },
        { name: "Anatomía", icon: LayoutGrid, iconColor: "#6366f1", progress: 88, questions: 290, correct: 255 },
    ];

    const examHistory = [
        { date: "Hoy, 14:30", type: "Simulacro - Cardiología", score: 82, questions: 50, time: "145 min" },
        { date: "Ayer, 10:15", type: "Examen por año 2023", score: 75, questions: 100, time: "180 min" },
        { date: "18 Mar, 16:00", type: "Simulacro - Pediatría", score: 68, questions: 50, time: "132 min" },
        { date: "15 Mar, 09:30", type: "Examen Extraordinario", score: 91, questions: 80, time: "165 min" },
        { date: "12 Mar, 11:00", type: "Simulacro - Farmacología", score: 78, questions: 45, time: "98 min" },
    ];

    const strengths = [
        { name: "Cardiología", icon: Heart, color: "#ef4444" },
        { name: "Anatomía", icon: LayoutGrid, color: "#6366f1" },
        { name: "Fisiología", icon: Heart, color: "#14b8a6" },
        { name: "Bioquímica", icon: Pill, color: "#f97316" },
    ];

    const weaknesses = [
        { name: "Neurología", icon: Brain, color: "#8b5cf6" },
        { name: "Cirugía General", icon: Scale, color: "#ec4899" },
        { name: "Psiquiatría", icon: Brain, color: "#06b6d4" },
        { name: "Oftalmología", icon: Eye, color: "#f43f5e" },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Métricas</Text>
                <Pressable onPress={toggleDarkMode} style={styles.notification}>
                    {darkMode ? (
                        <Sun size={22} color={colors.text} />
                    ) : (
                        <Moon size={22} color={colors.text} />
                    )}
                </Pressable>
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <HeatMapMonth />
                </View>

                <View style={styles.statsRow}>
                    <View style={[styles.timeStatCard, { backgroundColor: colors.card }]}>
                        <Clock size={24} color="#6366f1" />
                        <Text style={[styles.timeStatValue, { color: colors.text }]}>{overallStats.totalTime}</Text>
                        <Text style={[styles.timeStatLabel, { color: colors.subtitle }]}>Tiempo total</Text>
                    </View>
                    <View style={[styles.timeStatCard, { backgroundColor: colors.card }]}>
                        <BookOpen size={24} color="#0284c7" />
                        <Text style={[styles.timeStatValue, { color: colors.text }]}>{overallStats.totalQuestions.toLocaleString()}</Text>
                        <Text style={[styles.timeStatLabel, { color: colors.subtitle }]}>Preguntas</Text>
                    </View>
                </View>



                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Rendimiento por tema
                    </Text>
                    <View style={styles.blockList}>
                        {topicPerformance.slice(0, 5).map((topic, index) => (
                            <View key={index} style={[styles.blockCard, { backgroundColor: colors.card }]}>
                                <View style={[styles.blockNumber, { backgroundColor: topic.iconColor + "20" }]}>
                                    <topic.icon size={18} color={topic.iconColor} />
                                </View>
                                <View style={styles.blockContent}>
                                    <Text style={[styles.blockTitle, { color: colors.text }]} numberOfLines={1}>
                                        {topic.name}
                                    </Text>
                                    <Text style={[styles.blockSubtitle, { color: colors.subtitle }]}>
                                        {topic.correct}/{topic.questions} correctas
                                    </Text>
                                </View>
                                <Text style={[styles.blockProgress, { 
                                    color: topic.progress >= 70 ? "#22c55e" : topic.progress >= 40 ? "#f59e0b" : "#ef4444" 
                                }]}>{topic.progress}%</Text>
                            </View>
                        ))}
                    </View>
                    <Pressable style={styles.seeMoreButton} onPress={() => setShowTopicsModal(true)}>
                        <Text style={styles.seeMoreText}>Ver todos los temas ({topicPerformance.length})</Text>
                    </Pressable>
                </View>

                <View style={styles.swContainer}>
                    <View style={styles.swSection}>
                        <View style={styles.swHeaderRow}>
                            <TrendingUp size={18} color="#22c55e" />
                            <Text style={[styles.swTitle, { color: colors.text }]}>Fortalezas</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.swTagsRow}>
                                {strengths.map((item, index) => (
                                    <View key={index} style={[styles.swTag, { backgroundColor: item.color + "20" }]}>
                                        <item.icon size={14} color={item.color} />
                                        <Text style={[styles.swTagText, { color: item.color }]}>{item.name}</Text>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    <View style={styles.swSection}>
                        <View style={styles.swHeaderRow}>
                            <TrendingDown size={18} color="#ef4444" />
                            <Text style={[styles.swTitle, { color: colors.text }]}>A mejorar</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.swTagsRow}>
                                {weaknesses.map((item, index) => (
                                    <View key={index} style={[styles.swTag, { backgroundColor: item.color + "20" }]}>
                                        <item.icon size={14} color={item.color} />
                                        <Text style={[styles.swTagText, { color: item.color }]}>{item.name}</Text>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Historial de exámenes
                    </Text>
                    <View style={styles.blockList}>
                        {examHistory.map((exam, index) => (
                            <View key={index} style={[styles.blockCard, { backgroundColor: colors.card }]}>
                                <View style={[styles.blockNumber, { backgroundColor: exam.score >= 70 ? "#22c55e20" : exam.score >= 50 ? "#f59e0b20" : "#ef444420" }]}>
                                    <Text style={[styles.blockNumberText, { color: exam.score >= 70 ? "#22c55e" : exam.score >= 50 ? "#f59e0b" : "#ef4444" }]}>
                                        {exam.score}%
                                    </Text>
                                </View>
                                <View style={styles.blockContent}>
                                    <Text style={[styles.blockTitle, { color: colors.text }]} numberOfLines={1}>
                                        {exam.type}
                                    </Text>
                                    <Text style={[styles.blockSubtitle, { color: colors.subtitle }]}>
                                        {exam.date} • {exam.questions} preguntas
                                    </Text>
                                </View>
                                <View style={styles.blockAction}>
                                    <Clock size={16} color={colors.subtitle} />
                                </View>
                            </View>
                        ))}
                    </View>
                    <Pressable style={styles.seeMoreButton} onPress={() => setShowHistoryModal(true)}>
                        <Text style={styles.seeMoreText}>Ver todo el historial ({examHistory.length})</Text>
                    </Pressable>
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Modal Temas */}
            {showTopicsModal && (
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Todos los Temas</Text>
                            <Pressable onPress={() => setShowTopicsModal(false)} style={styles.modalClose}>
                                <X size={24} color={colors.text} />
                            </Pressable>
                        </View>
                        <ScrollView style={styles.modalScroll}>
                            <View style={styles.blockList}>
                                {topicPerformance.map((topic, index) => (
                                    <View key={index} style={[styles.blockCard, { backgroundColor: colors.card }]}>
                                        <View style={[styles.blockNumber, { backgroundColor: topic.iconColor + "20" }]}>
                                            <topic.icon size={18} color={topic.iconColor} />
                                        </View>
                                        <View style={styles.blockContent}>
                                            <Text style={[styles.blockTitle, { color: colors.text }]} numberOfLines={1}>
                                                {topic.name}
                                            </Text>
                                            <Text style={[styles.blockSubtitle, { color: colors.subtitle }]}>
                                                {topic.correct}/{topic.questions} correctas
                                            </Text>
                                        </View>
                                        <Text style={[styles.blockProgress, { 
                                            color: topic.progress >= 70 ? "#22c55e" : topic.progress >= 40 ? "#f59e0b" : "#ef4444" 
                                        }]}>{topic.progress}%</Text>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            )}

            {/* Modal Historial */}
            {showHistoryModal && (
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Historial de Exámenes</Text>
                            <Pressable onPress={() => setShowHistoryModal(false)} style={styles.modalClose}>
                                <X size={24} color={colors.text} />
                            </Pressable>
                        </View>
                        <ScrollView style={styles.modalScroll}>
                            <View style={styles.blockList}>
                                {examHistory.map((exam, index) => (
                                    <View key={index} style={[styles.blockCard, { backgroundColor: colors.card }]}>
                                        <View style={[styles.blockNumber, { backgroundColor: exam.score >= 70 ? "#22c55e20" : exam.score >= 50 ? "#f59e0b20" : "#ef444420" }]}>
                                            <Text style={[styles.blockNumberText, { color: exam.score >= 70 ? "#22c55e" : exam.score >= 50 ? "#f59e0b" : "#ef4444" }]}>
                                                {exam.score}%
                                            </Text>
                                        </View>
                                        <View style={styles.blockContent}>
                                            <Text style={[styles.blockTitle, { color: colors.text }]} numberOfLines={1}>
                                                {exam.type}
                                            </Text>
                                            <Text style={[styles.blockSubtitle, { color: colors.subtitle }]}>
                                                {exam.date} • {exam.questions} preguntas
                                            </Text>
                                        </View>
                                        <View style={styles.blockAction}>
                                            <Clock size={16} color={colors.subtitle} />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 45,
        paddingBottom: 15,
    },

    backButton: {
        padding: 8,
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },

    notification: {
        padding: 8,
    },

    container: {
        flex: 1,
        paddingHorizontal: 20,
    },

    section: {
        marginBottom: 20,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
    },

    // Heat Map
    heatMapContainer: {
        padding: 4,
        width: 252,
        alignSelf: "center",
    },

    heatMapHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },

    heatMapTitle: {
        fontSize: 16,
        fontWeight: "600",
    },

    heatMapLegend: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },

    heatMapLegendText: {
        fontSize: 10,
    },

    legendBox: {
        width: 12,
        height: 12,
        borderRadius: 2,
    },

    weekDaysRow: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginBottom: 8,
        gap: 4,
    },

    weekDayText: {
        fontSize: 11,
        width: 32,
        textAlign: "center",
        fontWeight: "500",
    },

    heatMapGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        gap: 4,
    },
    weeksContainer: {
        gap: 4,
    },
    weekRow: {
        flexDirection: "row",
        gap: 4,
    },

    heatMapCell: {
        width: 32,
        height: 28,
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
    },

    heatMapDayText: {
        fontSize: 10,
        fontWeight: "500",
    },

    // Stats Row
    statsRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 16,
    },

    timeStatCard: {
        flex: 1,
        padding: 16,
        borderRadius: 14,
        alignItems: "center",
    },

    timeStatValue: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 8,
    },

    timeStatLabel: {
        fontSize: 12,
        marginTop: 2,
    },

    // Ranking Card
    rankingCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
    },

    rankingHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },

    rankingTitle: {
        fontSize: 16,
        fontWeight: "600",
    },

    rankingContent: {
        flexDirection: "column",
        alignItems: "flex-end",
        marginBottom: 12,
        gap: 8,
    },

    rankingMain: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 8,
        alignSelf: "flex-start",
    },

    rankingNumber: {
        fontSize: 36,
        fontWeight: "bold",
    },

    rankingLabel: {
        fontSize: 14,
    },

    rankingPercentile: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },

    percentileText: {
        fontSize: 16,
        fontWeight: "600",
    },

    rankingProgressBg: {
        height: 8,
        backgroundColor: "#e2e8f0",
        borderRadius: 4,
        overflow: "hidden",
    },

    rankingProgressFill: {
        height: "100%",
        backgroundColor: "#22c55e",
        borderRadius: 4,
    },

    rankingLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 4,
    },

    rankingLabelsText: {
        fontSize: 10,
    },

    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 20,
    },
    statCard: { width: "48%", padding: 14, borderRadius: 14 },
    statIconContainer: { width: 38, height: 38, borderRadius: 10, justifyContent: "center", alignItems: "center", marginBottom: 10 },
    statTitle: { fontSize: 12, marginBottom: 2 },
    statValue: { fontSize: 20, fontWeight: "bold" },
    statSubtitle: { fontSize: 11, marginTop: 2 },
    trendContainer: { flexDirection: "row", alignItems: "center", marginTop: 6, gap: 4 },
    trendText: { fontSize: 11, fontWeight: "500" },
    horizontalScroll: { gap: 12, paddingRight: 20 },
    topicCard: { width: 110, padding: 14, borderRadius: 14, alignItems: "center" },
    topicCardIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 10 },
    topicCardName: { fontSize: 12, fontWeight: "500", textAlign: "center", marginBottom: 4 },
    topicCardProgress: { fontSize: 18, fontWeight: "bold" },
    seeMoreButton: { alignSelf: "center", marginTop: 12 },
    seeMoreText: { color: "#0284c7", fontSize: 13, fontWeight: "500" },
    swContainer: { marginBottom: 20 },
    swSection: { marginBottom: 16 },
    swHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
    swTitle: { fontSize: 16, fontWeight: "600" },
    swTagsRow: { flexDirection: "row", gap: 8 },
    swTag: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
    swTagText: { fontSize: 13, fontWeight: "500" },
    historyCard: { width: 160, padding: 14, borderRadius: 14 },
    historyCardHeader: { marginBottom: 12 },
    historyCardType: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
    historyCardDate: { fontSize: 11 },
    historyCardStats: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    historyCardScore: { fontSize: 20, fontWeight: "bold" },
    historyCardMeta: { fontSize: 11 },
    historyCardTime: { fontSize: 11 },
    
    // Block List Styles (Calendario Inteligente)
    blockList: { gap: 10 },
    blockCard: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, gap: 12 },
    blockNumber: { width: 40, height: 40, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    blockNumberText: { fontSize: 14, fontWeight: "700" },
    blockContent: { flex: 1, gap: 2 },
    blockTitle: { fontSize: 14, fontWeight: "600" },
    blockSubtitle: { fontSize: 12 },
    blockProgress: { fontSize: 18, fontWeight: "700" },
    blockAction: { padding: 4 },
    
    bottomSpacing: { height: 40 },
    
    // Modal Styles
    modalOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        height: "80%",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    modalClose: {
        padding: 8,
    },
    modalScroll: {
        flex: 1,
    },
});

