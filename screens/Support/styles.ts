import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 45,
        paddingBottom: 15,
    },
    backButton: {
        padding: 8,
        borderRadius: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        letterSpacing: -0.3,
    },
    headerPlaceholder: {
        width: 36,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 18,
        paddingBottom: 40,
    },

    // Hero Banner
    heroBanner: {
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "rgba(2, 132, 199, 0.15)",
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    heroIconBox: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: "rgba(2, 132, 199, 0.15)",
        justifyContent: "center",
        alignItems: "center",
    },
    heroContent: {
        flex: 1,
    },
    heroTitle: {
        fontSize: 17,
        fontWeight: "700",
        marginBottom: 4,
        letterSpacing: -0.3,
    },
    heroSubtitle: {
        fontSize: 14,
        lineHeight: 20,
    },

    // Form Section Card
    cardSection: {
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.08)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionHeading: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 20,
        letterSpacing: -0.3,
    },

    // Input Fields
    inputGroup: {
        marginBottom: 20,
    },
    labelRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 12,
    },
    optionalBadge: {
        fontSize: 11,
    },
    inputBox: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 13,
    },
    inputField: {
        flex: 1,
        fontSize: 15,
        marginLeft: 12,
        paddingVertical: 0,
    },

    // Select box
    selectBox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    selectValueText: {
        fontSize: 15,
    },

    // Priority segmented pills
    priorityRow: {
        flexDirection: "row",
        gap: 10,
    },
    priorityPill: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    priorityPillText: {
        fontSize: 13,
        fontWeight: "600",
    },

    // Text Area
    textAreaBox: {
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    textAreaField: {
        fontSize: 15,
        minHeight: 120,
    },
    charCounter: {
        fontSize: 12,
        textAlign: "right",
        marginTop: 6,
    },
    errorText: {
        color: "#ef4444",
        fontSize: 13,
        marginTop: 6,
        fontWeight: "500",
    },

    // Submit Button
    submitBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderRadius: 16,
        gap: 12,
        shadowColor: "#0284c7",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitBtnText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "700",
    },

    // Reason Modal Options
    reasonOption: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        marginBottom: 10,
        borderWidth: 1,
    },
    reasonOptionText: {
        fontSize: 15,
        fontWeight: "600",
    },

    // Modal Content styles
    modalMessageContainer: {
        alignItems: "center",
        paddingVertical: 12,
    },
    modalMessageText: {
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24,
    },
});
