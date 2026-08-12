import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../common/ThemeContext";
import { styles } from "./styles";

import {
    ArrowLeft,
    ChevronDown,
    Mail,
    Send,
    User
} from "lucide-react-native";

type Priority = "normal" | "alta" | "urgente";

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
    { value: "normal", label: "Normal", color: "#22c55e" },
    { value: "alta", label: "Alta", color: "#f59e0b" },
    { value: "urgente", label: "Urgente", color: "#ef4444" },
];

const MOTIVOS = [
    "Problema técnico",
    "Error en la aplicación",
    "Sugerencia de mejora",
    "Pregunta general",
    "Problema de cuenta",
    "Otros"
];

// Datos del usuario (simulados - en producción vendrían de AsyncStorage o API)
const USER_DATA = {
    nombreCompleto: "Juan Pérez García",
    email: "juan.perez@email.com"
};

export default function SupportScreen() {
    const { colors } = useTheme();
    const router = useRouter();

    const [formData, setFormData] = useState({
        nombreCompleto: USER_DATA.nombreCompleto,
        email: USER_DATA.email,
        motivo: "",
        prioridad: "normal" as Priority,
        descripcion: ""
    });

    const [showMotivoModal, setShowMotivoModal] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.motivo) {
            newErrors.motivo = "Selecciona un motivo de contacto";
        }

        if (!formData.descripcion.trim()) {
            newErrors.descripcion = "La descripción es requerida";
        } else if (formData.descripcion.trim().length < 20) {
            newErrors.descripcion = "La descripción debe tener al menos 20 caracteres";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            Alert.alert(
                "Solicitud Enviada",
                "Tu solicitud de soporte ha sido enviada. Te responderemos lo antes posible.",
                [
                    {
                        text: "Aceptar",
                        onPress: () => router.back()
                    }
                ]
            );
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
            <View style={[styles.header, { backgroundColor: colors.card }]}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    Soporte
                </Text>
                <View style={styles.headerPlaceholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Title Section */}
                <View style={styles.titleSection}>
                    <View style={styles.titleRow}>
                        <View style={[styles.supportIconContainer, { backgroundColor: "#fce7f3" }]}>
                            <User size={18} color="#db2777" />
                        </View>
                        <Text style={[styles.mainTitle, { color: colors.text }]}>
                            Envia tu consulta detallada
                        </Text>
                    </View>
                    <Text style={[styles.subtitle, { color: colors.subtitle }]}>
                        Completa el formulario y te responderemos lo antes posible.
                    </Text>
                </View>

                {/* Contact Information Section */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Información del contacto
                    </Text>

                    {/* Nombre Completo (Read-only) */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>
                            Nombre completo
                        </Text>
                        <View style={[
                            styles.inputContainer,
                            { backgroundColor: colors.background, borderColor: colors.inputBorder }
                        ]}>
                            <User size={20} color={colors.subtitle} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                value={formData.nombreCompleto}
                                editable={false}
                            />
                        </View>
                    </View>

                    {/* Email (Read-only) */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>
                            Email del contacto
                        </Text>
                        <View style={[
                            styles.inputContainer,
                            { backgroundColor: colors.background, borderColor: colors.inputBorder }
                        ]}>
                            <Mail size={20} color={colors.subtitle} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                value={formData.email}
                                editable={false}
                            />
                        </View>
                    </View>

                    {/* Motivo de contacto (Select) */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>
                            Motivo de contacto
                        </Text>
                        <TouchableOpacity
                            style={[
                                styles.selectContainer,
                                { backgroundColor: colors.background, borderColor: errors.motivo ? "#ef4444" : colors.inputBorder }
                            ]}
                            onPress={() => setShowMotivoModal(true)}
                        >
                            <Text style={[
                                styles.selectText,
                                { color: formData.motivo ? colors.text : colors.subtitle }
                            ]}>
                                {formData.motivo || "Selecciona un motivo"}
                            </Text>
                            <ChevronDown size={20} color={colors.subtitle} />
                        </TouchableOpacity>
                        {errors.motivo && (
                            <Text style={styles.errorText}>{errors.motivo}</Text>
                        )}
                    </View>

                    {/* Prioridad */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>
                            Prioridad
                        </Text>
                        <View style={styles.priorityContainer}>
                            {PRIORITIES.map((priority) => (
                                <TouchableOpacity
                                    key={priority.value}
                                    style={[
                                        styles.priorityButton,
                                        {
                                            backgroundColor: formData.prioridad === priority.value
                                                ? priority.color
                                                : colors.background,
                                            borderColor: priority.color
                                        }
                                    ]}
                                    onPress={() => updateField("prioridad", priority.value)}
                                >
                                    <Text style={[
                                        styles.priorityButtonText,
                                        {
                                            color: formData.prioridad === priority.value
                                                ? "white"
                                                : colors.text
                                        }
                                    ]}>
                                        {priority.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Descripción detallada */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>
                            Descripción detallada
                        </Text>
                        <View style={[
                            styles.textAreaContainer,
                            { backgroundColor: colors.background, borderColor: errors.descripcion ? "#ef4444" : colors.inputBorder }
                        ]}>
                            <TextInput
                                style={[styles.textArea, { color: colors.text }]}
                                placeholder="Describe tu problema o consulta con el mayor detalle posible..."
                                placeholderTextColor={colors.subtitle}
                                value={formData.descripcion}
                                onChangeText={(value) => updateField("descripcion", value)}
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
                    style={[styles.submitButton, { backgroundColor: "#0284c7" }]}
                    onPress={handleSubmit}
                    activeOpacity={0.8}
                >
                    <Send size={20} color="white" />
                    <Text style={styles.submitButtonText}>
                        Enviar solicitud
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Motivo Select Modal */}
            <Modal
                visible={showMotivoModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowMotivoModal(false)}
            >
                <Pressable 
                    style={styles.modalOverlay} 
                    onPress={() => setShowMotivoModal(false)}
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            Selecciona un motivo
                        </Text>
                        <ScrollView style={styles.modalScrollView}>
                            {MOTIVOS.map((motivo) => (
                                <TouchableOpacity
                                    key={motivo}
                                    style={[
                                        styles.modalOption,
                                        {
                                            backgroundColor: formData.motivo === motivo
                                                ? "#0284c7"
                                                : colors.background
                                        }
                                    ]}
                                    onPress={() => selectMotivo(motivo)}
                                >
                                    <Text style={[
                                        styles.modalOptionText,
                                        {
                                            color: formData.motivo === motivo
                                                ? "white"
                                                : colors.text
                                        }
                                    ]}>
                                        {motivo}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}
