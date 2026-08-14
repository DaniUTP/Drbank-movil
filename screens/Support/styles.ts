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
        borderRadius: 18,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "rgba(2, 132, 199, 0.12)",
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    heroIconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: "rgba(2, 132, 199, 0.12)",
        justifyContent: "center",
        alignItems: "center",
    },
    heroContent: {
        flex: 1,
    },
    heroTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 3,
        letterSpacing: -0.2,
    },
    heroSubtitle: {
        fontSize: 13,
        lineHeight: 18,
    },

    // Form Section Card
    cardSection: {
        borderRadius: 18,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.06)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    sectionHeading: {
        fontSize: 15,
        fontWeight: "700",
        marginBottom: 16,
        letterSpacing: -0.2,
    },

    // Input Fields
    inputGroup: {
        marginBottom: 16,
    },
    labelRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 7,
    },
    label: {
        fontSize: 13,
        fontWeight: "600",
    },
    optionalBadge: {
        fontSize: 11,
    },
    inputBox: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 11,
    },
    inputField: {
        flex: 1,
        fontSize: 14,
        marginLeft: 10,
        paddingVertical: 0,
    },

    // Select box
    selectBox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    selectValueText: {
        fontSize: 14,
    },

    // Priority segmented pills
    priorityRow: {
        flexDirection: "row",
        gap: 8,
    },
    priorityPill: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    priorityPillText: {
        fontSize: 12,
        fontWeight: "600",
    },

    // Text Area
    textAreaBox: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    textAreaField: {
        fontSize: 14,
        minHeight: 110,
    },
    charCounter: {
        fontSize: 11,
        textAlign: "right",
        marginTop: 4,
    },
    errorText: {
        color: "#ef4444",
        fontSize: 12,
        marginTop: 5,
        fontWeight: "500",
    },

    // Submit Button
    submitBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 15,
        borderRadius: 14,
        gap: 10,
        shadowColor: "#0284c7",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
    },
    submitBtnText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "700",
    },

    // Reason Modal Options
    reasonOption: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 13,
        paddingHorizontal: 14,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
    },
    reasonOptionText: {
        fontSize: 14,
        fontWeight: "600",
    },

    // Modal Content styles
    modalMessageContainer: {
        alignItems: "center",
        paddingVertical: 10,
    },
    modalMessageText: {
        fontSize: 15,
        textAlign: "center",
        lineHeight: 22,
    },
});
