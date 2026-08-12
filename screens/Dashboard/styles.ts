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
    marginBottom: 16,
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
  calendarList: {
    gap: 16,
  },
  dayCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    minHeight: 72,
  },
  dayIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  dayContent: {
    flex: 1,
    marginLeft: 12,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dayText: {
    fontSize: 12,
    fontWeight: "600",
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: "bold",
  },
  daySubject: {
    fontSize: 14,
    marginTop: 2,
  },
  dayProgress: {
    fontSize: 18,
    fontWeight: "bold",
  },
  progressContainer: {
    justifyContent: "center",
    alignItems: "center",
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
