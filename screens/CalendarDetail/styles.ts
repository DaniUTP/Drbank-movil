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
    fontWeight: "bold",
  },

  specialtyCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
  },

  specialtyContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  specialtyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  specialtyInfo: {
    marginLeft: 15,
    flex: 1,
  },

  specialtyLabel: {
    fontSize: 12,
    marginBottom: 2,
  },

  specialtyName: {
    fontSize: 20,
    fontWeight: "bold",
  },

  specialtyArea: {
    fontSize: 14,
    marginTop: 2,
  },

  progressSection: {
    marginBottom: 25,
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    alignSelf: "flex-start",
  },

  circularProgressContainer: {
    alignItems: "center",
    marginBottom: 15,
  },

  progressStats: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 25,
  },

  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  statText: {
    fontSize: 14,
    color: "#64748b",
  },

  scheduleSection: {
    marginBottom: 25,
  },

  blockCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },

  blockNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  blockNumberText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#475569",
  },

  blockContent: {
    flex: 1,
  },

  blockHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    flexWrap: "wrap",
  },

  blockTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
    color: "#334155",
  },

  lockedText: {
    color: "#94a3b8",
  },

  weaknessBadge: {
    backgroundColor: "#fef9c3",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fde047",
  },

  weaknessText: {
    fontSize: 11,
    color: "#a16207",
    fontWeight: "600",
    marginLeft: 4,
  },

  blockTopic: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
  },

  blockArea: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },

  studyInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },

  studyDuration: {
    fontSize: 11,
    color: "#ca8a04",
    fontWeight: "500",
  },

  blockAction: {
    marginLeft: 10,
  },

  startIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6366f1",
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
});
