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

  dateHeader: {
    marginBottom: 20,
  },

  dateText: {
    fontSize: 24,
    fontWeight: "700",
  },

  specialtyCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    backgroundColor: "#f8fafc",
  },

  specialtyContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  specialtyIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  specialtyInfo: {
    marginLeft: 12,
    flex: 1,
  },

  specialtyLabel: {
    fontSize: 12,
    marginBottom: 2,
    fontWeight: "500",
    color: "#64748b",
  },

  specialtyName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },

  specialtyArea: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: "400",
    color: "#64748b",
  },

  progressSection: {
    marginBottom: 20,
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    alignSelf: "flex-start",
  },

  circularProgressContainer: {
    alignItems: "center",
    marginBottom: 12,
  },

  progressStats: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },

  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  statText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748b",
  },

  scheduleSection: {
    marginBottom: 20,
  },

  blockCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  blockNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  blockNumberText: {
    fontWeight: "600",
    fontSize: 14,
    color: "#64748b",
  },

  blockContent: {
    flex: 1,
  },

  blockHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
    flexWrap: "wrap",
  },

  blockTitle: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 6,
    color: "#475569",
  },

  lockedText: {
    color: "#94a3b8",
  },

  weaknessBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
    flexDirection: "row",
    alignItems: "center",
  },

  weaknessText: {
    fontSize: 10,
    color: "#92400e",
    fontWeight: "500",
    marginLeft: 2,
  },

  blockTopic: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },

  blockArea: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 1,
  },

  studyInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 3,
  },

  studyDuration: {
    fontSize: 10,
    color: "#d97706",
    fontWeight: "400",
  },

  blockAction: {
    marginLeft: 8,
  },

  startIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0284c7",
    justifyContent: "center",
    alignItems: "center",
  },

  libreContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  libreText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  libreSubtext: {
    fontSize: 16,
    textAlign: "center",
  },
  bottomSpacing: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    width: "80%",
    maxWidth: 300,
  },
  modalLogo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
  },
});
