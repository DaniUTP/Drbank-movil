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
    marginBottom: 16,
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
    marginBottom: 22,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 14,
    alignSelf: "flex-start",
  },

  circularProgressContainer: {
    alignItems: "center",
    marginBottom: 12,
  },

  progressStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
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
    minHeight: 86,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 18,
    marginBottom: 12,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  blockCardActive: {
    shadowColor: "#0369a1",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  blockNumber: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  blockNumberActive: {
    backgroundColor: "#e0f2fe",
  },

  blockNumberCompleted: {
    backgroundColor: "#dcfce7",
  },

  blockNumberText: {
    fontWeight: "800",
    fontSize: 15,
    color: "#0284c7",
  },

  blockContent: {
    flex: 1,
  },

  blockHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
    flexWrap: "wrap",
  },

  blockTitle: {
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 6,
    color: "#64748b",
    letterSpacing: 0.35,
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
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    color: "#1e293b",
  },

  blockArea: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 3,
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
    marginLeft: 10,
  },

  startIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
  videoPlayer: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#0f172a",
  },
  videoHint: {
    flex: 1,
    color: "#64748b",
    fontSize: 13,
    lineHeight: 19,
  },
  videoHintCompleted: { color: "#166534" },
  videoOverlay: { flex: 1, padding: 18, justifyContent: "center", backgroundColor: "rgba(15,23,42,0.72)" },
  videoModalCard: { width: "100%", maxWidth: 520, alignSelf: "center", padding: 16, borderRadius: 24, backgroundColor: "#ffffff" },
  videoModalHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 14 },
  videoTitleContainer: { flex: 1, paddingRight: 12 },
  videoEyebrow: { color: "#0284c7", fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginBottom: 4 },
  videoTitle: { color: "#0f172a", fontSize: 19, lineHeight: 24, fontWeight: "800" },
  videoCloseIcon: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#f1f5f9" },
  videoStatusBox: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14, padding: 12, borderRadius: 14, backgroundColor: "#f0f9ff" },
  videoStatusBoxCompleted: { backgroundColor: "#f0fdf4" },
  videoCloseButton: { minHeight: 48, marginTop: 14, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#0284c7" },
  videoCloseButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "800" },
  videoActions: { flexDirection: "row", gap: 10, marginTop: 14 },
  videoSecondaryButton: { flex: 0.8, minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#f1f5f9" },
  videoSecondaryButtonText: { color: "#334155", fontSize: 15, fontWeight: "700" },
  videoPracticeButton: { flex: 1.2, minHeight: 48, flexDirection: "row", gap: 5, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#0284c7" },
  videoPracticeButtonDisabled: { backgroundColor: "#94a3b8", opacity: 0.65 },
  progressCard: { padding: 17, borderRadius: 22, backgroundColor: "#f8fbff", borderWidth: 1, borderColor: "#dbeafe", shadowColor: "#0f172a", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  progressCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  progressCardEyebrow: { color: "#0284c7", fontSize: 10, fontWeight: "800", letterSpacing: 0.7, marginBottom: 4 },
  progressCardTitle: { fontSize: 15, fontWeight: "700" },
  progressPercentBadge: { minWidth: 48, height: 40, paddingHorizontal: 8, alignItems: "center", justifyContent: "center", borderRadius: 20, backgroundColor: "#e0f2fe" },
  progressPercentText: { color: "#0369a1", fontSize: 15, fontWeight: "800" },
  linearProgressTrack: { height: 8, marginTop: 14, overflow: "hidden", borderRadius: 4, backgroundColor: "#e2e8f0" },
  linearProgressFill: { height: "100%", borderRadius: 4, backgroundColor: "#0284c7" },
});
