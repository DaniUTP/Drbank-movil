import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Pressable,
    ScrollView,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Modal from "../../common/Modal";
import { useTheme } from "../../common/ThemeContext";
import { styles } from "./styles";

import {
    ArrowLeft,
    BookOpen,
    Brain,
    Clock,
    Heart,
    LayoutGrid,
    Moon,
    Pill,
    Scale,
    Sun,
    TrendingUp
} from "lucide-react-native";

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

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Rendimiento</Text>
                <Pressable onPress={toggleDarkMode} style={styles.notification}>
                    {darkMode ? (
                        <Sun size={22} color={colors.text} />
                    ) : (
                        <Moon size={22} color={colors.text} />
                    )}
                </Pressable>
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Ranking Section */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <View style={styles.rankingHeader}>
                        <TrendingUp size={20} color="#22c55e" />
                        <Text style={[styles.rankingTitle, { color: colors.text }]}>Tu Ranking</Text>
                    </View>
                    <View style={styles.rankingContent}>
                        <View style={styles.rankingMain}>
                            <Text style={[styles.rankingNumber, { color: colors.text }]}>#{overallStats.rank}</Text>
                            <Text style={[styles.rankingLabel, { color: colors.subtitle }]}>de {overallStats.totalUsers.toLocaleString()} usuarios</Text>
                        </View>
                        <View style={styles.rankingPercentile}>
                            <Text style={[styles.percentileText, { color: "#22c55e" }]}>Top {Math.round((1 - overallStats.rank / overallStats.totalUsers) * 100)}%</Text>
                        </View>
                    </View>
                    <View style={styles.rankingProgressBg}>
                        <View style={[styles.rankingProgressFill, { width: `${((overallStats.totalUsers - overallStats.rank) / overallStats.totalUsers) * 100}%` }]} />
                    </View>
                    <View style={styles.rankingLabels}>
                        <Text style={[styles.rankingLabelsText, { color: colors.subtitle }]}>#1</Text>
                        <Text style={[styles.rankingLabelsText, { color: colors.subtitle }]}>#{overallStats.totalUsers.toLocaleString()}</Text>
                    </View>
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
            <Modal
                visible={showTopicsModal}
                onClose={() => setShowTopicsModal(false)}
                title="Todos los Temas"
            >
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
            </Modal>

            {/* Modal Historial */}
            <Modal
                visible={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                title="Historial de Exámenes"
            >
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
            </Modal>
        </SafeAreaView>
    );
}

