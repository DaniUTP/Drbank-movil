import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  formContent: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    fontSize: 14,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    color: "#ef4444",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 20,
    flexWrap: "nowrap",
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },
  checkbox: {
    width: 17,
    height: 17,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#94a3b8",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#0284c7",
    borderColor: "#0284c7",
  },
  checkmark: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: -1,
  },
  rememberMe: {
    fontSize: 12,
    fontWeight: "500",
  },
  forgotPassword: {
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 0,
  },
  button: {
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0284c7",
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
});
