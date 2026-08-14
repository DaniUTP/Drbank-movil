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
        borderRadius: 8,
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        letterSpacing: -0.3,
    },

    notification: {
        padding: 8,
        borderRadius: 8,
    },

    container: {
        flex: 1,
        paddingHorizontal: 16,
    },

    section: {
        marginBottom: 24,
    },

    sectionHeader: {
        marginBottom: 12,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: -0.3,
    },

    sectionSubtitle: {
        fontSize: 13,
        marginTop: 2,
        lineHeight: 18,
    },

    // ==========================================
    // RANKING SUMMARY CARD
    // ==========================================
    rankingCard: {
        borderRadius: 16,
        padding: 18,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.06)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },

    rankingCardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },

    rankingCardHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    rankingIconBadge: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: "#fef3c7",
        justifyContent: "center",
        alignItems: "center",
    },

    rankingCardTitle: {
        fontSize: 15,
        fontWeight: "700",
    },

    rankingTotalPill: {
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: "rgba(2, 132, 199, 0.08)",
    },

    rankingTotalPillText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#0284c7",
    },

    rankingMainRow: {
        flexDirection: "row",
        alignItems: "baseline",
        justifyContent: "space-between",
        marginBottom: 14,
    },

    rankingRankNumber: {
        fontSize: 32,
        fontWeight: "800",
        letterSpacing: -0.5,
    },

    rankingRankLabel: {
        fontSize: 13,
        fontWeight: "500",
    },

    rankingButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 11,
        paddingHorizontal: 14,
        borderRadius: 10,
        backgroundColor: "rgba(2, 132, 199, 0.06)",
    },

    rankingButtonText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#0284c7",
    },

    // ==========================================
    // SEGMENTED TABS
    // ==========================================
    tabsWrapper: {
        flexDirection: "row",
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
        gap: 4,
    },

    tabItem: {
        flex: 1,
        paddingVertical: 9,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 9,
    },

    tabItemActive: {
        backgroundColor: "#0284c7",
        shadowColor: "#0284c7",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
    },

    tabItemText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#64748b",
    },

    tabItemTextActive: {
        color: "#ffffff",
        fontWeight: "700",
    },

    // ==========================================
    // PERFORMANCE LIST ITEMS
    // ==========================================
    performanceList: {
        gap: 12,
    },

    performanceCard: {
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.06)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
        elevation: 1,
    },

    performanceCardTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },

    performanceTitle: {
        fontSize: 15,
        fontWeight: "700",
        flex: 1,
        marginRight: 10,
    },

    accuracyBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },

    accuracyBadgeText: {
        fontSize: 12,
        fontWeight: "700",
    },

    progressBarBg: {
        height: 6,
        backgroundColor: "#f1f5f9",
        borderRadius: 3,
        overflow: "hidden",
        marginBottom: 10,
    },

    progressBarFill: {
        height: "100%",
        borderRadius: 3,
    },

    statsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 4,
    },

    statColumn: {
        alignItems: "center",
    },

    statValue: {
        fontSize: 13,
        fontWeight: "700",
    },

    statLabel: {
        fontSize: 11,
        marginTop: 1,
    },

    statDivider: {
        width: 1,
        height: 20,
        backgroundColor: "rgba(0, 0, 0, 0.08)",
    },

    // ==========================================
    // PAGINATION CONTROLS
    // ==========================================
    paginationContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 4,
        marginTop: 12,
    },

    paginationButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 9,
        paddingHorizontal: 14,
        borderRadius: 10,
        backgroundColor: "rgba(2, 132, 199, 0.08)",
    },

    paginationButtonDisabled: {
        opacity: 0.35,
    },

    paginationButtonText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#0284c7",
    },

    paginationIndicator: {
        fontSize: 13,
        fontWeight: "600",
    },

    // ==========================================
    // EMPTY STATE
    // ==========================================
    emptyCard: {
        padding: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.06)",
    },

    emptyIconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "rgba(2, 132, 199, 0.08)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },

    emptyTitle: {
        fontSize: 15,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 4,
    },

    emptySubtitle: {
        fontSize: 13,
        textAlign: "center",
        lineHeight: 18,
        maxWidth: 260,
    },

    // ==========================================
    // MODAL STYLES
    // ==========================================
    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 14,
    },

    searchInput: {
        flex: 1,
        paddingVertical: 9,
        fontSize: 14,
    },

    rankingList: {
        gap: 8,
    },

    rankingListItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.04)",
        gap: 12,
    },

    rankingPositionBadge: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },

    rankingPositionText: {
        fontSize: 13,
        fontWeight: "700",
    },

    rankingUserContent: {
        flex: 1,
    },

    rankingUserName: {
        fontSize: 14,
        fontWeight: "600",
    },

    userHighlightBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: "#0284c7",
        marginLeft: 6,
        alignSelf: "center",
    },

    userHighlightText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#ffffff",
    },

    rankingUserUniv: {
        fontSize: 12,
        marginTop: 1,
    },

    rankingUserPoints: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0284c7",
    },

    rankingUserPointsLabel: {
        fontSize: 10,
        textAlign: "right",
    },

    bottomSpacing: {
        height: 40,
    },
});
