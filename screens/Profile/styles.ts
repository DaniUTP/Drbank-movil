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
    avatarSection: {
        alignItems: "center",
        paddingVertical: 24,
    },
    avatarContainer: {
        width: 90,
        height: 90,
        borderRadius: 45,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#ffffff",
    },
    cameraButton: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    userName: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        gap: 8,
    },
    sectionIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        flex: 1,
    },
    unsavedIndicator: {
        backgroundColor: "#fef3c7",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    unsavedText: {
        color: "#92400e",
        fontSize: 12,
        fontWeight: "600",
    },
    sectionSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    card: {
        borderRadius: 16,
        padding: 4,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    infoContent: {
        flex: 1,
        marginLeft: 12,
    },
    infoLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
    },
    editButton: {
        padding: 8,
    },
    divider: {
        height: 1,
        marginLeft: 68,
    },
    passwordField: {
        padding: 12,
    },
    fieldHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    fieldLabel: {
        fontSize: 13,
    },
    required: {
        fontSize: 14,
        fontWeight: "bold",
        marginLeft: 4,
    },
    passwordInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
    },
    eyeButton: {
        padding: 8,
    },
    requiredNote: {
        fontSize: 12,
        marginBottom: 12,
        marginLeft: 4,
    },
    saveButton: {
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: "center",
        marginTop: 8,
        marginBottom: 16,
    },
    saveButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
    bottomSpacing: {
        height: 40,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    modalInput: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: "row",
        gap: 12,
    },
    modalCancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: "center",
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: "600",
    },
    modalSaveButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    modalSaveText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
});
