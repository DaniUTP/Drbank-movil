import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Modal from "../../common/Modal";
import { useTheme } from "../../common/ThemeContext";
import { styles } from "./styles";

import { useProfileQuery } from "@/services/profile/profile.rtkq";
import { useGetHistoryQuery } from "@/services/question/history.rtkq";
import { useRankingQuery } from "@/services/question/ranking.rtkq";
import { GetHistoryItemDTO } from "@/types/question/history.dto";
import { RankingResponseDTO } from "@/types/question/ranking.dto";

import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    FolderKanban,
    Moon,
    Search,
    Sun,
    Trophy
} from "lucide-react-native";

const PAGE_LIMIT = 10;

export default function MetricScreen() {
    const { colors, darkMode, toggleDarkMode } = useTheme();
    const router = useRouter();

    // Tab state: 'area' | 'specialty' | 'theme'
    const [activeCategoryTab, setActiveCategoryTab] = useState<'area' | 'specialty' | 'theme'>('area');
    const [page, setPage] = useState(1);

    // Modal state
    const [showRankingModal, setShowRankingModal] = useState(false);
    const [rankingSearch, setRankingSearch] = useState("");

    // 1. Profile Query (to detect current user)
    const { data: profileData } = useProfileQuery();

    // 2. Ranking Query
    const { data: rankingData = [], isLoading: rankingLoading } = useRankingQuery();

    // 3. Paginated History Query with page, limit, and groupBy
    const {
        data: historyDataRaw,
        isLoading: historyLoading,
        isFetching: historyFetching
    } = useGetHistoryQuery({
        page,
        limit: PAGE_LIMIT,
        groupBy: activeCategoryTab,
    });

    // Safely extract items array
    const historyItems: GetHistoryItemDTO[] = useMemo(() => {
        if (!historyDataRaw) return [];
        if (Array.isArray(historyDataRaw.history)) return historyDataRaw.history;
        if (Array.isArray(historyDataRaw)) return historyDataRaw;
        if (Array.isArray((historyDataRaw as any).data)) return (historyDataRaw as any).data;
        if (Array.isArray((historyDataRaw as any).items)) return (historyDataRaw as any).items;
        return [];
    }, [historyDataRaw]);

    const lastPage = historyDataRaw?.last_page || 1;
    const hasNextPage = page < lastPage;
    const hasPrevPage = page > 1;

    // Handle tab change
    const handleTabChange = (tab: 'area' | 'specialty' | 'theme') => {
        if (tab !== activeCategoryTab) {
            setActiveCategoryTab(tab);
            setPage(1);
        }
    };

    // Calculate user position in Top 10 (returns rank number if in top 10, otherwise null)
    const userRank = useMemo(() => {
        if (!profileData || !rankingData || rankingData.length === 0) return null;
        const currentFullName = `${profileData.name || ''} ${profileData.last_name || ''}`.trim().toLowerCase();
        
        const index = rankingData.findIndex((u: RankingResponseDTO) => {
            const uName = `${u.name || ''} ${u.last_name || ''}`.trim().toLowerCase();
            return uName === currentFullName;
        });

        if (index !== -1 && index < 10) {
            return index + 1; // 1-indexed position in Top 10
        }
        return null;
    }, [profileData, rankingData]);

    // Top 10 ranking list to display inline
    const top10Ranking = useMemo(() => {
        return rankingData.slice(0, 10);
    }, [rankingData]);

    // Filtered ranking for full modal
    const filteredRanking = useMemo(() => {
        if (!rankingSearch.trim()) return rankingData;
        const q = rankingSearch.toLowerCase();
        return rankingData.filter((user: RankingResponseDTO) => {
            const fullName = `${user.name || ''} ${user.last_name || ''}`.toLowerCase();
            const university = (user.university || '').toLowerCase();
            return fullName.includes(q) || university.includes(q);
        });
    }, [rankingData, rankingSearch]);

    // Format accuracy
    const calculateAccuracy = (ok: number, total: number): number => {
        if (!total || total <= 0) return 0;
        return Math.round((ok / total) * 100);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={22} color={colors.text} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Rendimiento Académico</Text>
                <Pressable onPress={toggleDarkMode} style={styles.notification}>
                    {darkMode ? (
                        <Sun size={20} color={colors.text} />
                    ) : (
                        <Moon size={20} color={colors.text} />
                    )}
                </Pressable>
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Top 10 Ranking Card */}
                <View style={[styles.rankingCard, { backgroundColor: colors.card }]}>
                    <View style={styles.rankingCardHeader}>
                        <View style={styles.rankingCardHeaderLeft}>
                            <View style={styles.rankingIconBadge}>
                                <Trophy size={16} color="#d97706" />
                            </View>
                            <Text style={[styles.rankingCardTitle, { color: colors.text }]}>
                                Top 10 Ranking Nacional
                            </Text>
                        </View>
                    </View>

                    {rankingLoading ? (
                        <View style={{ paddingVertical: 16, alignItems: "center" }}>
                            <ActivityIndicator size="small" color="#0284c7" />
                        </View>
                    ) : (
                        <>
                            {/* If user is in top 10, display user rank position */}
                            {userRank !== null && (
                                <View style={styles.rankingMainRow}>
                                    <View>
                                        <Text style={[styles.rankingRankNumber, { color: colors.text }]}>
                                            #{userRank}
                                        </Text>
                                        <Text style={[styles.rankingRankLabel, { color: colors.subtitle || "#64748b" }]}>
                                            Tu posición actual (Top 10)
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {/* Top 10 Leaderboard List */}
                            <View style={styles.rankingList}>
                                {top10Ranking.map((user: RankingResponseDTO, index: number) => {
                                    const rank = index + 1;
                                    const isTop3 = rank <= 3;
                                    const badgeBg = rank === 1 ? "#fef3c7" : rank === 2 ? "#f1f5f9" : rank === 3 ? "#ffedd5" : "transparent";
                                    const badgeColor = rank === 1 ? "#d97706" : rank === 2 ? "#475569" : rank === 3 ? "#c2410c" : (colors.subtitle || "#64748b");
                                    const isCurrentUser = userRank === rank;

                                    return (
                                        <View
                                            key={index}
                                            style={[
                                                styles.rankingListItem,
                                                {
                                                    backgroundColor: isCurrentUser
                                                        ? (darkMode ? "rgba(2, 132, 199, 0.18)" : "#f0f9ff")
                                                        : (darkMode ? "#0f172a" : "#f8fafc"),
                                                    borderColor: isCurrentUser
                                                        ? "#0284c7"
                                                        : isTop3 ? (darkMode ? "#334155" : "#e2e8f0") : "rgba(0,0,0,0.04)"
                                                }
                                            ]}
                                        >
                                            <View style={[styles.rankingPositionBadge, { backgroundColor: badgeBg }]}>
                                                <Text style={[styles.rankingPositionText, { color: badgeColor }]}>
                                                    #{rank}
                                                </Text>
                                            </View>

                                            <View style={styles.rankingUserContent}>
                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                    <Text style={[styles.rankingUserName, { color: colors.text }]} numberOfLines={1}>
                                                        {user.name} {user.last_name}
                                                    </Text>
                                                    {isCurrentUser && (
                                                        <View style={styles.userHighlightBadge}>
                                                            <Text style={styles.userHighlightText}>Tú</Text>
                                                        </View>
                                                    )}
                                                </View>
                                                {user.university ? (
                                                    <Text style={[styles.rankingUserUniv, { color: colors.subtitle || "#64748b" }]} numberOfLines={1}>
                                                        {user.university}
                                                    </Text>
                                                ) : null}
                                            </View>

                                            <View>
                                                <Text style={styles.rankingUserPoints}>
                                                    {user.points?.toLocaleString() || 0}
                                                </Text>
                                                <Text style={[styles.rankingUserPointsLabel, { color: colors.subtitle || "#64748b" }]}>
                                                    puntos
                                                </Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>

                            {rankingData.length > 10 && (
                                <Pressable
                                    style={[styles.rankingButton, { marginTop: 12 }]}
                                    onPress={() => {
                                        setRankingSearch("");
                                        setShowRankingModal(true);
                                    }}
                                >
                                    <Text style={styles.rankingButtonText}>
                                        Ver clasificación completa ({rankingData.length})
                                    </Text>
                                    <ChevronRight size={16} color="#0284c7" />
                                </Pressable>
                            )}
                        </>
                    )}
                </View>

                {/* Section: Academic Performance */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Diagnóstico por Disciplina
                        </Text>
                        <Text style={[styles.sectionSubtitle, { color: colors.subtitle || "#64748b" }]}>
                            Resultados cuantitativos y porcentaje de efectividad.
                        </Text>
                    </View>

                    {/* Segmented Tabs */}
                    <View style={[styles.tabsWrapper, { backgroundColor: darkMode ? "#1e293b" : "#f1f5f9" }]}>
                        <Pressable
                            style={[
                                styles.tabItem,
                                activeCategoryTab === 'area' && styles.tabItemActive
                            ]}
                            onPress={() => handleTabChange('area')}
                        >
                            <Text style={[
                                styles.tabItemText,
                                activeCategoryTab === 'area' && styles.tabItemTextActive
                            ]}>
                                Áreas
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.tabItem,
                                activeCategoryTab === 'specialty' && styles.tabItemActive
                            ]}
                            onPress={() => handleTabChange('specialty')}
                        >
                            <Text style={[
                                styles.tabItemText,
                                activeCategoryTab === 'specialty' && styles.tabItemTextActive
                            ]}>
                                Especialidades
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.tabItem,
                                activeCategoryTab === 'theme' && styles.tabItemActive
                            ]}
                            onPress={() => handleTabChange('theme')}
                        >
                            <Text style={[
                                styles.tabItemText,
                                activeCategoryTab === 'theme' && styles.tabItemTextActive
                            ]}>
                                Temas
                            </Text>
                        </Pressable>
                    </View>

                    {/* Loading State */}
                    {historyLoading || historyFetching ? (
                        <View style={{ paddingVertical: 40, alignItems: "center" }}>
                            <ActivityIndicator size="small" color="#0284c7" />
                            <Text style={{ marginTop: 8, fontSize: 13, color: colors.subtitle || "#64748b" }}>
                                Cargando datos...
                            </Text>
                        </View>
                    ) : historyItems.length === 0 ? (
                        /* Empty State */
                        <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
                            <View style={styles.emptyIconBox}>
                                <FolderKanban size={24} color="#0284c7" />
                            </View>
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>
                                Sin registros disponibles
                            </Text>
                            <Text style={[styles.emptySubtitle, { color: colors.subtitle || "#64748b" }]}>
                                No se encontraron datos para esta categoría en la página actual.
                            </Text>
                        </View>
                    ) : (
                        /* Performance Data List */
                        <View style={styles.performanceList}>
                            {historyItems.map((item: GetHistoryItemDTO, index: number) => {
                                const total = item.count || ((item.ok || 0) + (item.error || 0) + (item.empty || 0));
                                const accuracy = calculateAccuracy(item.ok || 0, total);

                                const isHigh = accuracy >= 70;
                                const isMid = accuracy >= 40;
                                const badgeBg = isHigh ? "#dcfce7" : isMid ? "#fef3c7" : "#fee2e2";
                                const badgeColor = isHigh ? "#15803d" : isMid ? "#b45309" : "#b91c1c";
                                const barColor = isHigh ? "#22c55e" : isMid ? "#f59e0b" : "#ef4444";

                                return (
                                    <View key={item.id || index} style={[styles.performanceCard, { backgroundColor: colors.card }]}>
                                        <View style={styles.performanceCardTop}>
                                            <Text style={[styles.performanceTitle, { color: colors.text }]} numberOfLines={1}>
                                                {item.name || "Sin nombre"}
                                            </Text>
                                            <View style={[styles.accuracyBadge, { backgroundColor: badgeBg }]}>
                                                <Text style={[styles.accuracyBadgeText, { color: badgeColor }]}>
                                                    {accuracy}%
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Progress Bar */}
                                        <View style={styles.progressBarBg}>
                                            <View style={[styles.progressBarFill, { width: `${Math.max(accuracy, 2)}%`, backgroundColor: barColor }]} />
                                        </View>

                                        {/* Numerical Stats Row */}
                                        <View style={styles.statsRow}>
                                            <View style={styles.statColumn}>
                                                <Text style={[styles.statValue, { color: "#16a34a" }]}>{item.ok || 0}</Text>
                                                <Text style={[styles.statLabel, { color: colors.subtitle || "#64748b" }]}>Correctas</Text>
                                            </View>
                                            <View style={styles.statDivider} />
                                            <View style={styles.statColumn}>
                                                <Text style={[styles.statValue, { color: "#dc2626" }]}>{item.error || 0}</Text>
                                                <Text style={[styles.statLabel, { color: colors.subtitle || "#64748b" }]}>Incorrectas</Text>
                                            </View>
                                            <View style={styles.statDivider} />
                                            <View style={styles.statColumn}>
                                                <Text style={[styles.statValue, { color: colors.subtitle || "#64748b" }]}>{item.empty || 0}</Text>
                                                <Text style={[styles.statLabel, { color: colors.subtitle || "#64748b" }]}>En blanco</Text>
                                            </View>
                                            <View style={styles.statDivider} />
                                            <View style={styles.statColumn}>
                                                <Text style={[styles.statValue, { color: colors.text }]}>{total}</Text>
                                                <Text style={[styles.statLabel, { color: colors.subtitle || "#64748b" }]}>Total</Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}

                            {/* Pagination Controls */}
                            <View style={styles.paginationContainer}>
                                <Pressable
                                    style={[
                                        styles.paginationButton,
                                        !hasPrevPage && styles.paginationButtonDisabled
                                    ]}
                                    disabled={!hasPrevPage || historyFetching}
                                    onPress={() => setPage(p => Math.max(1, p - 1))}
                                >
                                    <ChevronLeft size={16} color="#0284c7" />
                                    <Text style={styles.paginationButtonText}>Anterior</Text>
                                </Pressable>

                                <Text style={[styles.paginationIndicator, { color: colors.text }]}>
                                    Página {page} de {lastPage}
                                </Text>

                                <Pressable
                                    style={[
                                        styles.paginationButton,
                                        !hasNextPage && styles.paginationButtonDisabled
                                    ]}
                                    disabled={!hasNextPage || historyFetching}
                                    onPress={() => setPage(p => p + 1)}
                                >
                                    <Text style={styles.paginationButtonText}>Siguiente</Text>
                                    <ChevronRight size={16} color="#0284c7" />
                                </Pressable>
                            </View>
                        </View>
                    )}
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Full Ranking Modal */}
            <Modal
                visible={showRankingModal}
                onClose={() => setShowRankingModal(false)}
                title="Clasificación General"
            >
                <View style={[styles.searchBox, { borderColor: darkMode ? "#334155" : "#e2e8f0" }]}>
                    <Search size={16} color={colors.subtitle || "#64748b"} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Buscar por estudiante o universidad..."
                        placeholderTextColor={colors.subtitle || "#64748b"}
                        value={rankingSearch}
                        onChangeText={setRankingSearch}
                    />
                </View>

                <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                    <View style={styles.rankingList}>
                        {filteredRanking.map((user: RankingResponseDTO, index: number) => {
                            const rank = index + 1;
                            const isTop3 = rank <= 3;
                            const badgeBg = rank === 1 ? "#fef3c7" : rank === 2 ? "#f1f5f9" : rank === 3 ? "#ffedd5" : "transparent";
                            const badgeColor = rank === 1 ? "#d97706" : rank === 2 ? "#475569" : rank === 3 ? "#c2410c" : (colors.subtitle || "#64748b");
                            const isCurrentUser = userRank === rank;

                            return (
                                <View
                                    key={index}
                                    style={[
                                        styles.rankingListItem,
                                        {
                                            backgroundColor: isCurrentUser
                                                ? (darkMode ? "rgba(2, 132, 199, 0.18)" : "#f0f9ff")
                                                : isTop3 ? (darkMode ? "#1e293b" : "#ffffff") : (darkMode ? "#0f172a" : "#f8fafc"),
                                            borderColor: isCurrentUser
                                                ? "#0284c7"
                                                : isTop3 ? (darkMode ? "#334155" : "#e2e8f0") : "rgba(0,0,0,0.04)"
                                        }
                                    ]}
                                >
                                    <View style={[styles.rankingPositionBadge, { backgroundColor: badgeBg }]}>
                                        <Text style={[styles.rankingPositionText, { color: badgeColor }]}>
                                            #{rank}
                                        </Text>
                                    </View>

                                    <View style={styles.rankingUserContent}>
                                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                                            <Text style={[styles.rankingUserName, { color: colors.text }]} numberOfLines={1}>
                                                {user.name} {user.last_name}
                                            </Text>
                                            {isCurrentUser && (
                                                <View style={styles.userHighlightBadge}>
                                                    <Text style={styles.userHighlightText}>Tú</Text>
                                                </View>
                                            )}
                                        </View>
                                        {user.university ? (
                                            <Text style={[styles.rankingUserUniv, { color: colors.subtitle || "#64748b" }]} numberOfLines={1}>
                                                {user.university}
                                            </Text>
                                        ) : null}
                                    </View>

                                    <View>
                                        <Text style={styles.rankingUserPoints}>
                                            {user.points?.toLocaleString() || 0}
                                        </Text>
                                        <Text style={[styles.rankingUserPointsLabel, { color: colors.subtitle || "#64748b" }]}>
                                            puntos
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>
            </Modal>
        </SafeAreaView>
    );
}
