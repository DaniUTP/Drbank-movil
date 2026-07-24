import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useTheme } from "../components/ThemeContext";

import {
    ArrowLeft,
    Camera,
    Edit2,
    Eye,
    EyeOff,
    GraduationCap,
    Lock,
    Mail,
    Moon,
    Phone,
    Sun,
    User
} from "lucide-react-native";

export default function ProfileScreen() {
    const { colors, darkMode, toggleDarkMode } = useTheme();
    const router = useRouter();
    
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Estado para el modal de edición
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingField, setEditingField] = useState<string>("");
    const [tempValue, setTempValue] = useState("");
    
    // Datos de ejemplo del usuario
    const userData = {
        nombre: "Juan",
        apellidos: "Pérez García",
        email: "juan.perez@email.com",
        celular: "",
        universidad: "Universidad Nacional Mayor de San Marcos"
    };
    
    const [formData, setFormData] = useState({
        nombre: userData.nombre,
        apellidos: userData.apellidos,
        email: userData.email,
        celular: userData.celular,
        universidad: userData.universidad,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    
    // Memoized handlers to prevent unnecessary re-renders
    const getInitials = useCallback(() => {
        const firstName = formData.nombre.charAt(0).toUpperCase();
        const lastName = formData.apellidos.charAt(0).toUpperCase();
        return `${firstName}${lastName}`;
    }, [formData.nombre, formData.apellidos]);
    
    const handleSave = useCallback(() => {
        console.log("Guardando cambios...", formData);
    }, [formData]);
    
    const openEditModal = useCallback((field: string, currentValue: string) => {
        setEditingField(field);
        setTempValue(currentValue);
        setShowEditModal(true);
    }, []);
    
    const saveEdit = useCallback(() => {
        setFormData({ ...formData, [editingField]: tempValue });
        setShowEditModal(false);
        setEditingField("");
    }, [formData, editingField, tempValue]);
    
    const getFieldLabel = useCallback((field: string) => {
        switch (field) {
            case "nombre": return "Nombre(s)";
            case "apellidos": return "Apellidos";
            case "celular": return "Celular";
            case "universidad": return "Universidad";
            default: return "";
        }
    }, []);

    // Memoized back handler
    const handleBack = useCallback(() => router.back(), [router]);

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <Pressable onPress={handleBack} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Perfil</Text>
                <Pressable onPress={toggleDarkMode} style={styles.notification}>
                    {darkMode ? (
                        <Sun size={22} color={colors.text} />
                    ) : (
                        <Moon size={22} color={colors.text} />
                    )}
                </Pressable>
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={[styles.avatarContainer, { backgroundColor: "#0284c7" }]}>
                        <Text style={styles.avatarText}>{getInitials()}</Text>
                        <Pressable style={[styles.cameraButton, { backgroundColor: colors.card }]}>
                            <Camera size={14} color={colors.text} />
                        </Pressable>
                    </View>
                    <Text style={[styles.userName, { color: colors.text }]}>
                        {formData.nombre} {formData.apellidos}
                    </Text>
                    <Text style={[styles.userEmail, { color: colors.subtitle }]}>
                        {formData.email}
                    </Text>
                </View>

                {/* Información Personal */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Información Personal
                    </Text>
                    
                    <View style={[styles.card, { backgroundColor: colors.card }]}>
                        {/* Nombre */}
                        <View style={styles.infoRow}>
                            <View style={[styles.iconContainer, { backgroundColor: "#0284c720" }]}>
                                <User size={20} color="#0284c7" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoLabel, { color: colors.subtitle }]}>Nombre(s)</Text>
                                <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
                                    {formData.nombre || "Sin registrar"}
                                </Text>
                            </View>
                            <TouchableOpacity 
                                onPress={() => openEditModal("nombre", formData.nombre)}
                                style={styles.editButton}
                            >
                                <Edit2 size={18} color={editingField === "nombre" ? "#3b82f6" : "#000000"} />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={[styles.divider, { backgroundColor: colors.subtitle + "20" }]} />
                        
                        {/* Apellidos */}
                        <View style={styles.infoRow}>
                            <View style={[styles.iconContainer, { backgroundColor: "#0284c720" }]}>
                                <User size={20} color="#0284c7" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoLabel, { color: colors.subtitle }]}>Apellidos</Text>
                                <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
                                    {formData.apellidos || "Sin registrar"}
                                </Text>
                            </View>
                            <TouchableOpacity 
                                onPress={() => openEditModal("apellidos", formData.apellidos)}
                                style={styles.editButton}
                            >
                                <Edit2 size={18} color={editingField === "apellidos" ? "#3b82f6" : "#000000"} />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={[styles.divider, { backgroundColor: colors.subtitle + "20" }]} />
                        
                        {/* Correo electrónico - Solo lectura */}
                        <View style={styles.infoRow}>
                            <View style={[styles.iconContainer, { backgroundColor: "#22c55e20" }]}>
                                <Mail size={20} color="#22c55e" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoLabel, { color: colors.subtitle }]}>Correo electrónico</Text>
                                <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
                                    {formData.email}
                                </Text>
                            </View>
                        </View>
                        
                        <View style={[styles.divider, { backgroundColor: colors.subtitle + "20" }]} />
                        
                        {/* Celular */}
                        <View style={styles.infoRow}>
                            <View style={[styles.iconContainer, { backgroundColor: "#f59e0b20" }]}>
                                <Phone size={20} color="#f59e0b" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoLabel, { color: colors.subtitle }]}>Celular</Text>
                                <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
                                    {formData.celular || "Sin registrar"}
                                </Text>
                            </View>
                            <TouchableOpacity 
                                onPress={() => openEditModal("celular", formData.celular)}
                                style={styles.editButton}
                            >
                                <Edit2 size={18} color={editingField === "celular" ? "#3b82f6" : "#000000"} />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={[styles.divider, { backgroundColor: colors.subtitle + "20" }]} />
                        
                        {/* Universidad */}
                        <View style={styles.infoRow}>
                            <View style={[styles.iconContainer, { backgroundColor: "#ec489920" }]}>
                                <GraduationCap size={20} color="#ec4899" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoLabel, { color: colors.subtitle }]}>Universidad</Text>
                                <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
                                    {formData.universidad || "Sin registrar"}
                                </Text>
                            </View>
                            <TouchableOpacity 
                                onPress={() => openEditModal("universidad", formData.universidad)}
                                style={styles.editButton}
                            >
                                <Edit2 size={18} color={editingField === "universidad" ? "#3b82f6" : "#000000"} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                
                {/* Cambiar Contraseña */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionIcon, { backgroundColor: "#ef444420" }]}>
                            <Lock size={20} color="#ef4444" />
                        </View>
                        <View>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Seguridad
                            </Text>
                            <Text style={[styles.sectionSubtitle, { color: colors.subtitle }]}>
                                Actualiza tu contraseña de acceso
                            </Text>
                        </View>
                    </View>
                    
                    <View style={[styles.card, { backgroundColor: colors.card }]}>
                        {/* Contraseña actual - Requerido */}
                        <View style={styles.passwordField}>
                            <View style={styles.fieldHeader}>
                                <Text style={[styles.fieldLabel, { color: colors.subtitle }]}>Contraseña actual</Text>
                                <Text style={[styles.required, { color: "#ef4444" }]}>*</Text>
                            </View>
                            <View style={[styles.passwordInputContainer, { backgroundColor: colors.background }]}>
                                <TextInput
                                    style={[styles.passwordInput, { color: colors.text }]}
                                    value={formData.currentPassword}
                                    onChangeText={(text) => setFormData({ ...formData, currentPassword: text })}
                                    placeholder="••••••••"
                                    placeholderTextColor={colors.subtitle}
                                    secureTextEntry={!showCurrentPassword}
                                />
                                <Pressable 
                                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                    style={styles.eyeButton}
                                >
                                    {showCurrentPassword ? (
                                        <EyeOff size={18} color={colors.subtitle} />
                                    ) : (
                                        <Eye size={18} color={colors.subtitle} />
                                    )}
                                </Pressable>
                            </View>
                        </View>
                        
                        {/* Nueva contraseña - Requerido */}
                        <View style={styles.passwordField}>
                            <View style={styles.fieldHeader}>
                                <Text style={[styles.fieldLabel, { color: colors.subtitle }]}>Nueva contraseña</Text>
                                <Text style={[styles.required, { color: "#ef4444" }]}>*</Text>
                            </View>
                            <View style={[styles.passwordInputContainer, { backgroundColor: colors.background }]}>
                                <TextInput
                                    style={[styles.passwordInput, { color: colors.text }]}
                                    value={formData.newPassword}
                                    onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
                                    placeholder="••••••••"
                                    placeholderTextColor={colors.subtitle}
                                    secureTextEntry={!showNewPassword}
                                />
                                <Pressable 
                                    onPress={() => setShowNewPassword(!showNewPassword)}
                                    style={styles.eyeButton}
                                >
                                    {showNewPassword ? (
                                        <EyeOff size={18} color={colors.subtitle} />
                                    ) : (
                                        <Eye size={18} color={colors.subtitle} />
                                    )}
                                </Pressable>
                            </View>
                        </View>
                        
                        {/* Confirmar nueva contraseña - Requerido */}
                        <View style={styles.passwordField}>
                            <View style={styles.fieldHeader}>
                                <Text style={[styles.fieldLabel, { color: colors.subtitle }]}>Confirmar contraseña</Text>
                                <Text style={[styles.required, { color: "#ef4444" }]}>*</Text>
                            </View>
                            <View style={[styles.passwordInputContainer, { backgroundColor: colors.background }]}>
                                <TextInput
                                    style={[styles.passwordInput, { color: colors.text }]}
                                    value={formData.confirmPassword}
                                    onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                                    placeholder="••••••••"
                                    placeholderTextColor={colors.subtitle}
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <Pressable 
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={styles.eyeButton}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={18} color={colors.subtitle} />
                                    ) : (
                                        <Eye size={18} color={colors.subtitle} />
                                    )}
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </View>
                
                {/* Campos requeridos indicator */}
                <Text style={[styles.requiredNote, { color: colors.subtitle }]}>
                    Los campos marcados con * son requeridos
                </Text>
                
                {/* Botón Guardar */}
                <Pressable 
                    style={[styles.saveButton, { backgroundColor: "#0284c7" }]}
                    onPress={handleSave}
                >
                    <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                </Pressable>
                
                <View style={styles.bottomSpacing} />
            </ScrollView>
            
            {/* Modal de Edición */}
            <Modal
                visible={showEditModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowEditModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                Editar {getFieldLabel(editingField)}
                            </Text>
                        </View>
                        
                        <TextInput
                            style={[
                                styles.modalInput, 
                                { backgroundColor: colors.card, color: colors.text, borderColor: colors.subtitle + "30" }
                            ]}
                            value={tempValue}
                            onChangeText={setTempValue}
                            placeholder={`Ingresa ${getFieldLabel(editingField).toLowerCase()}`}
                            placeholderTextColor={colors.subtitle}
                            autoFocus={true}
                        />
                        
                        <View style={styles.modalButtons}>
                            <Pressable 
                                style={[styles.modalCancelButton, { borderColor: colors.subtitle }]}
                                onPress={() => {
                                    setShowEditModal(false);
                                    setEditingField("");
                                }}
                            >
                                <Text style={[styles.modalCancelText, { color: colors.subtitle }]}>Cancelar</Text>
                            </Pressable>
                            <Pressable 
                                style={[styles.modalSaveButton, { backgroundColor: "#0284c7" }]}
                                onPress={saveEdit}
                            >
                                <Text style={styles.modalSaveText}>Guardar</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
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
    avatarSection: {
        alignItems: "center",
        paddingVertical: 24,
    },
    avatarContainer: {
        width: 90,
        height: 90,
        borderRadius: 45,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#ffffff",
    },
    cameraButton: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    userName: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 12,
    },
    sectionIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    sectionSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    card: {
        borderRadius: 16,
        padding: 4,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    infoContent: {
        flex: 1,
        marginLeft: 12,
    },
    infoLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
    },
    editButton: {
        padding: 8,
    },
    divider: {
        height: 1,
        marginLeft: 68,
    },
    passwordField: {
        padding: 12,
    },
    fieldHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    fieldLabel: {
        fontSize: 13,
    },
    required: {
        fontSize: 14,
        fontWeight: "bold",
        marginLeft: 4,
    },
    passwordInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        paddingHorizontal: 14,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
    },
    eyeButton: {
        padding: 8,
    },
    requiredNote: {
        fontSize: 12,
        marginBottom: 12,
        marginLeft: 4,
    },
    saveButton: {
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: "center",
        marginTop: 8,
        marginBottom: 16,
    },
    saveButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
    bottomSpacing: {
        height: 40,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    modalInput: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: "row",
        gap: 12,
    },
    modalCancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: "center",
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: "600",
    },
    modalSaveButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    modalSaveText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
});
