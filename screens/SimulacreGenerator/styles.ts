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
    marginBottom: 25,
    marginTop: 10,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  titleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
  },

  mainTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  section: {
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
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

  optional: {
    fontWeight: "normal",
    fontSize: 12,
  },

  selector: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  selectorText: {
    fontSize: 16,
    flex: 1,
  },

  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
  },

  clearButtonText: {
    color: "#ef4444",
    fontSize: 12,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: 20,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },

  modalSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    marginBottom: 10,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    padding: 0,
  },

  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },

  optionItemText: {
    fontSize: 16,
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

  modalDoneButton: {
    marginHorizontal: 15,
    marginTop: 15,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  modalDoneButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Slider styles
  sliderContainer: {
    marginBottom: 25,
  },

  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  valueBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  valueBadgeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0284c7",
  },

  slider: {
    width: "100%",
    height: 40,
  },

  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -5,
  },

  sliderLabelText: {
    fontSize: 12,
    color: "#64748b",
  },

  createButton: {
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
  },

  createButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  bottomSpacing: {
    height: 40,
  },
});
