import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
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
