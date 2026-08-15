import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Modal from "../../common/Modal";
import { useTheme } from "../../common/ThemeContext";
import { styles } from "./styles";

import { useLazySupportQuery } from "@/services/external/support.rtkq";
import { useProfileQuery } from "@/services/profile/profile.rtkq";

import {
    AlertCircle,
    ArrowLeft,
    Check,
    CheckCircle2,
    ChevronDown,
    Mail,
    Send,
    User
} from "lucide-react-native";

type Priority = "normal" | "alta" | "urgente";

const PRIORITIES: { value: Priority; label: string; color: string; bg: string }[] = [
    { value: "normal", label: "Normal", color: "#16a34a", bg: "rgba(22, 163, 74, 0.1)" },
    { value: "alta", label: "Media / Alta", color: "#d97706", bg: "rgba(217, 119, 6, 0.1)" },
    { value: "urgente", label: "Urgente", color: "#dc2626", bg: "rgba(220, 38, 38, 0.1)" },
];

const MOTIVOS = [
    "Problema técnico en la aplicación",
    "Reporte de pregunta o contenido",
    "Sugerencia de mejora",
    "Consulta sobre suscripción o cuenta",
    "Pregunta académica general",
    "Otros motivos"
];

export default function SupportScreen() {
    const { colors, darkMode } = useTheme();
    const router = useRouter();

    // Profile query to get current user data
    const { data: profileData, isLoading: isProfileLoading } = useProfileQuery();

    // Support query trigger
    const [triggerSupport, { isLoading: isSubmitting }] = useLazySupportQuery();

    const [formData, setFormData] = useState({
        nombreCompleto: "",
        lastName: "",
        email: "",
        motivo: "",
        prioridad: "normal" as Priority,
        descripcion: ""
    });

    // Response Modal State (replaces Alert)
    const [responseModal, setResponseModal] = useState<{
        visible: boolean;
        isSuccess: boolean;
        message: string;
    }>({
        visible: false,
        isSuccess: true,
        message: "",
    });

    const [showMotivoModal, setShowMotivoModal] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (profileData) {
            const fullName = `${profileData.name || ""} ${profileData.last_name || ""}`.trim();
            setFormData(prev => ({
                ...prev,
                nombreCompleto: fullName || "Usuario DrBank",
                lastName: profileData.last_name || "",
                email: profileData.email || "",
            }));
        }
    }, [profileData]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.motivo) {
            newErrors.motivo = "Por favor selecciona un motivo de consulta.";
        }

        if (!formData.descripcion.trim()) {
            newErrors.descripcion = "La descripción de la consulta es requerida.";
        } else if (formData.descripcion.trim().length < 10) {
            newErrors.descripcion = "Describe tu caso con al menos 10 caracteres.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const result = await triggerSupport({
                last_name: formData.lastName || profileData?.last_name || formData.nombreCompleto,
                email: formData.email || profileData?.email || "",
                reason: formData.motivo,
                description: formData.descripcion.trim(),
                response: formData.prioridad || "normal",
            }).unwrap();

            setResponseModal({
                visible: true,
                isSuccess: true,
                message: result?.message || "Tu solicitud de soporte ha sido enviada con éxito. Nuestro equipo te responderá a la brevedad a tu correo electrónico.",
            });
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || "No se pudo enviar la solicitud de soporte. Por favor verifica tu conexión e inténtalo nuevamente.";
            setResponseModal({
                visible: true,
                isSuccess: false,
                message: errorMessage,
            });
        }
    };

    const handleCloseResponseModal = () => {
        const wasSuccess = responseModal.isSuccess;
        setResponseModal(prev => ({ ...prev, visible: false }));
        if (wasSuccess) {
            router.back();
        }
    };

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const selectMotivo = (motivo: string) => {
        setFormData(prev => ({ ...prev, motivo }));
        setShowMotivoModal(false);
        if (errors.motivo) {
            setErrors(prev => ({ ...prev, motivo: "" }));
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[styles.backButton, { backgroundColor: colors.card }]}
                >
                    <ArrowLeft size={22} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    Centro de Soporte
                </Text>
                <View style={styles.headerPlaceholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Form Card */}
                <View style={[styles.cardSection, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionHeading, { color: colors.text }]}>
                        Datos de la Consulta
                    </Text>

                    {/* Nombre Completo */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>
                            Estudiante / Médico
                        </Text>
                        <View style={[
                            styles.inputBox,
                            { backgroundColor: darkMode ? "#0f172a" : "#f8fafc", borderColor: darkMode ? "#334155" : "#e2e8f0" }
                        ]}>
                            <User size={18} color={colors.subtitle || "#64748b"} />
                            <TextInput
                                style={[styles.inputField, { color: colors.text }]}
                                value={isProfileLoading ? "Cargando..." : formData.nombreCompleto}
                                editable={false}
                            />
                        </View>
                    </View>

                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>
                            Correo de contacto
                        </Text>
                        <View style={[
                            styles.inputBox,
                            { backgroundColor: darkMode ? "#0f172a" : "#f8fafc", borderColor: darkMode ? "#334155" : "#e2e8f0" }
                        ]}>
                            <Mail size={18} color={colors.subtitle || "#64748b"} />
                            <TextInput
                                style={[styles.inputField, { color: colors.text }]}
                                value={isProfileLoading ? "Cargando..." : formData.email}
                                editable={false}
                            />
                        </View>
                    </View>

                    {/* Motivo de contacto */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>
                            Motivo de la solicitud *
                        </Text>
                        <TouchableOpacity
                            style={[
                                styles.selectBox,
                                {
                                    backgroundColor: darkMode ? "#0f172a" : "#ffffff",
                                    borderColor: errors.motivo ? "#ef4444" : (darkMode ? "#334155" : "#e2e8f0")
                                }
                            ]}
                            onPress={() => setShowMotivoModal(true)}
                            activeOpacity={1}
                        >
                            <Text style={[
                                styles.selectValueText,
                                { color: formData.motivo ? colors.text : (colors.subtitle || "#94a3b8") }
                            ]}>
                                {formData.motivo || "Selecciona un motivo..."}
                            </Text>
                            <ChevronDown size={18} color={colors.subtitle || "#64748b"} />
                        </TouchableOpacity>
                        {errors.motivo && (
                            <Text style={styles.errorText}>{errors.motivo}</Text>
                        )}
                    </View>

                    {/* Prioridad */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>
                            Nivel de urgencia
                        </Text>
                        <View style={styles.priorityRow}>
                            {PRIORITIES.map((priority) => {
                                const isSelected = formData.prioridad === priority.value;
                                return (
                                    <TouchableOpacity
                                        key={priority.value}
                                        style={[
                                            styles.priorityPill,
                                            {
                                                backgroundColor: isSelected ? priority.color : (darkMode ? "#0f172a" : "#f8fafc"),
                                                borderColor: isSelected ? priority.color : (darkMode ? "#334155" : "#e2e8f0")
                                            }
                                        ]}
                                        onPress={() => updateField("prioridad", priority.value)}
                                        activeOpacity={1}
                                    >
                                        <Text style={[
                                            styles.priorityPillText,
                                            { color: isSelected ? "#ffffff" : (colors.subtitle || "#64748b") }
                                        ]}>
                                            {priority.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Descripción */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Text style={[styles.label, { color: colors.text }]}>
                                Descripción detallada *
                            </Text>
                            <Text style={[styles.charCounter, { color: colors.subtitle || "#64748b" }]}>
                                {formData.descripcion.length}/500
                            </Text>
                        </View>
                        <View style={[
                            styles.textAreaBox,
                            {
                                backgroundColor: darkMode ? "#0f172a" : "#ffffff",
                                borderColor: errors.descripcion ? "#ef4444" : (darkMode ? "#334155" : "#e2e8f0")
                            }
                        ]}>
                            <TextInput
                                style={[styles.textAreaField, { color: colors.text }]}
                                placeholder="Describe con claridad lo sucedido o la consulta que deseas realizar..."
                                placeholderTextColor={colors.subtitle || "#94a3b8"}
                                value={formData.descripcion}
                                onChangeText={(value) => updateField("descripcion", value.slice(0, 500))}
                                multiline
                                numberOfLines={5}
                                textAlignVertical="top"
                            />
                        </View>
                        {errors.descripcion && (
                            <Text style={styles.errorText}>{errors.descripcion}</Text>
                        )}
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[
                        styles.submitBtn,
                        { backgroundColor: "#0284c7", opacity: isSubmitting ? 0.7 : 1 }
                    ]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    activeOpacity={0.85}
                >
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <>
                            <Send size={18} color="#ffffff" />
                            <Text style={styles.submitBtnText}>
                                Enviar Solicitud de Soporte
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Motivo Selector Modal using Common Modal */}
            <Modal
                visible={showMotivoModal}
                onClose={() => setShowMotivoModal(false)}
                title="Motivo de Contacto"
                footerText="Cerrar"
            >
                <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
                    {MOTIVOS.map((motivo) => {
                        const isSelected = formData.motivo === motivo;
                        return (
                            <TouchableOpacity
                                key={motivo}
                                style={[
                                    styles.reasonOption,
                                    {
                                        backgroundColor: isSelected
                                            ? (darkMode ? "rgba(2, 132, 199, 0.2)" : "#f0f9ff")
                                            : (darkMode ? "#1e293b" : "#f8fafc"),
                                        borderColor: isSelected ? "#0284c7" : (darkMode ? "#334155" : "#e2e8f0")
                                    }
                                ]}
                                onPress={() => selectMotivo(motivo)}
                                activeOpacity={1}
                            >
                                <Text style={[
                                    styles.reasonOptionText,
                                    { color: isSelected ? "#0284c7" : colors.text }
                                ]}>
                                    {motivo}
                                </Text>
                                {isSelected && <Check size={18} color="#0284c7" />}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </Modal>

            {/* Response / Feedback Modal using Common Modal */}
            <Modal
                visible={responseModal.visible}
                onClose={handleCloseResponseModal}
                title={responseModal.isSuccess ? "Solicitud Enviada" : "Atención"}
                icon={
                    responseModal.isSuccess ? (
                        <CheckCircle2 size={46} color="#16a34a" />
                    ) : (
                        <AlertCircle size={46} color="#ef4444" />
                    )
                }
                footerText={responseModal.isSuccess ? "Aceptar" : "Reintentar"}
            >
                <View style={styles.modalMessageContainer}>
                    <Text style={[styles.modalMessageText, { color: colors.text }]}>
                        {responseModal.message}
                    </Text>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
