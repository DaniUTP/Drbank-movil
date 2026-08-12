import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
  formContent: {
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#64748b",
    marginTop: 5,
  },
  inputGroup: {
    marginTop: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#64748b",
  },
  input: {
    height: 55,
    borderRadius: 18,
    paddingHorizontal: 15,
    borderWidth: 1,
    marginTop: 5,
  },
  errorText: {
    fontSize: 12,
    marginTop: 5,
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#64748b",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: "bold",
  },
  rememberMeText: {
    fontSize: 14,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: "500",
  },
  button: {
    marginTop: 25,
    height: 55,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
