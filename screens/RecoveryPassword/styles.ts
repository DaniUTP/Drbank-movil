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
  backContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  backText: {
    fontSize: 14,
  },
});
