import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 35,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  notification: {
    padding: 8,
  },
  greeting: {
    fontSize: 14,
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
  },
  aiCard: {
    backgroundColor: "#0f4c81",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  aiLabel: {
    color: "#93c5fd",
    fontSize: 12,
    marginBottom: 5,
  },
  aiTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  aiText: {
    color: "#cbd5f5",
  },
  aiTopic: {
    color: "white",
    fontWeight: "600",
    marginBottom: 15,
  },
  aiButton: {
    backgroundColor: "white",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  aiButtonText: {
    color: "#0f4c81",
    fontWeight: "bold",
  },
  metricsContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },
  metricLabel: {
    fontSize: 12,
  },
  calendarSection: {
    marginBottom: 100,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  calendarTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  progressHeader: {
    backgroundColor: "#0284c7",
    borderRadius: 24,
    padding: 28,
    marginBottom: 28,
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  progressTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "white",
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: 20,
  },
  progressBarContainer: {
    height: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 10,
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  progressStat: {
    fontSize: 15,
    fontWeight: "700",
    color: "white",
  },
  calendarList: {
    gap: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
  },
  dayCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    minHeight: 72,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  dayCardToday: {
    borderColor: "#0284c7",
    borderWidth: 2,
  },
  dayCardPressed: {
    backgroundColor: "#e0f2fe",
    borderColor: "#0284c7",
    borderWidth: 2,
  },
  dayIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  dayContent: {
    flex: 1,
    marginLeft: 14,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 2,
  },
  dayText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1e293b",
  },
  daySubject: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
    color: "#334155",
  },
  dayProgress: {
    fontSize: 18,
    fontWeight: "bold",
  },
  progressContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  circularProgress: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  progressText: {
    fontSize: 12,
    fontWeight: "bold",
  },
});
