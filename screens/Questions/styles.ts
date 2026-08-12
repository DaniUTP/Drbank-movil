import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    backgroundColor: "white",
  },

  backButton: {
    padding: 8,
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },

  headerTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },

  headerSubtitle: {
    fontSize: 11,
    marginTop: 2,
    opacity: 0.7,
  },

  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  timerText: {
    fontSize: 14,
    fontWeight: "bold",
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  questionContainer: {
    marginTop: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  questionHeader: {
    marginBottom: 20,
  },

  questionNumber: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 10,
  },

  progressBar: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 4,
  },

  questionText: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 26,
    marginBottom: 24,
    color: "#1e293b",
  },

  optionsContainer: {
    gap: 12,
  },

  option: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },

  optionLetter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },

  optionLetterText: {
    fontSize: 15,
    fontWeight: "bold",
  },

  optionText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },

  feedbackContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  feedbackText: {
    fontSize: 16,
    fontWeight: "bold",
  },

  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    gap: 12,
  },

  navButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#0284c7",
  },

  navButtonDisabled: {
    borderColor: "#94a3b8",
  },

  navButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },

  nextButton: {
    backgroundColor: "#0284c7",
    borderColor: "#0284c7",
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  nextButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },

  finishButton: {
    backgroundColor: "#0284c7",
    borderColor: "#0284c7",
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  finishButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },

  bottomSpacing: {
    height: 40,
  },

  resultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  resultsHeader: {
    alignItems: "center",
    marginBottom: 30,
  },

  resultsIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },

  resultsTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
  },

  resultsStats: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 30,
  },

  statItem: {
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  statValue: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 14,
    fontWeight: "500",
  },

  resultsTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 30,
    backgroundColor: "white",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  resultsTimeText: {
    fontSize: 18,
    fontWeight: "600",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalBody: {
    alignItems: "center",
    marginBottom: 30,
    flexDirection: "row",
    gap: 16,
  },
  warningIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
  },
  modalMessage: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
    fontWeight: "500",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "transparent",
  },
  confirmButton: {
    backgroundColor: "#0284c7",
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  modalButtonTextConfirm: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
  },
  explanationImmediate: {
    marginTop: 15,
    backgroundColor: "#f0f9ff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0f2fe",
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0369a1",
  },
  explanationText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
    fontWeight: "500",
    textAlign: "justify",
  },
  feedbackSection: {
    marginTop: 20,
  },
  confirmIconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  cancelButtonText: {
    color: "#64748b",
    fontSize: 16,
    fontWeight: "700",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
