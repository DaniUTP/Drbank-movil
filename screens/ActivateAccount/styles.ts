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
    marginBottom: 30,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 24,
    fontWeight: "600",
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
    fontSize: 18,
    letterSpacing: 2,
    textAlign: "center",
    textTransform: "lowercase",
  },
  errorText: {
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
  },
  button: {
    marginTop: 30,
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
  resendContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  link: {
    fontSize: 14,
    fontWeight: "500",
  },
  backContainer: {
    marginTop: 15,
    alignItems: "center",
  },
  backText: {
    fontSize: 14,
  },
});
