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

  titleSection: {
    marginBottom: 24,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  titleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  mainTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },

  inputContainer: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },

  required: {
    color: "#ef4444",
  },

  helperText: {
    fontSize: 12,
    marginTop: 4,
  },

  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },

  selectorText: {
    fontSize: 15,
    flex: 1,
  },

  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    alignSelf: "flex-start",
  },

  clearButtonText: {
    color: "#ef4444",
    fontSize: 13,
    marginLeft: 4,
  },

  examModeItem: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "white",
  },

  examModeItemSelected: {
    backgroundColor: "#f0f9ff",
  },

  examModeItemHeader: {
    marginBottom: 12,
  },

  examModeItemTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  examModeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  examModeIconText: {
    fontSize: 20,
  },

  examModeItemTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },

  examModeItemDescription: {
    fontSize: 13,
    fontWeight: "500",
  },

  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0284c7",
    justifyContent: "center",
    alignItems: "center",
  },

  examModeDetailsContainer: {
    paddingLeft: 56,
    gap: 8,
  },

  examModeDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  detailDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  examModeDetailText: {
    fontSize: 13,
    flex: 1,
  },

  modalSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },

  modalContent: {
    maxHeight: "70%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 10,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },

  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },

  optionItemText: {
    fontSize: 15,
  },

  configItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },

  configLabel: {
    fontSize: 14,
  },

  configValue: {
    fontSize: 14,
    fontWeight: "500",
  },

  createButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },

  createButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },

  bottomSpacing: {
    height: 40,
  },
});
