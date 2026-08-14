import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
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
import { useProfileQuery } from "@/services/profile/profile.rtkq";
import { useLazyChangePasswordQuery } from "@/services/profile/change-password.rtkq";

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
    
    const { data: profileData, isLoading: isProfileLoading } = useProfileQuery();
    const [triggerChangePassword, { isLoading: isChangingPassword }] = useLazyChangePasswordQuery();
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Estado para el modal de edición
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingField, setEditingField] = useState<string>("");
    const [tempValue, setTempValue] = useState("");
    
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        university: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    React.useEffect(() => {
        if (profileData) {
            setFormData(prev => ({
                ...prev,
                firstName: profileData.name || "",
                lastName: profileData.last_name || "",
                email: profileData.email || "",
                phone: profileData.phone || "",
                university: profileData.university || "",
            }));
        }
    }, [profileData]);
    
    // Memoized handlers to prevent unnecessary re-renders
    const getInitials = useCallback(() => {
        const firstInitial = (formData.firstName || profileData?.name || "").charAt(0).toUpperCase();
        const lastInitial = (formData.lastName || profileData?.last_name || "").charAt(0).toUpperCase();
        return `${firstInitial}${lastInitial}` || "DR";
    }, [formData.firstName, formData.lastName, profileData]);
    
    const handleChangePassword = useCallback(async () => {
        setPasswordError("");
        setPasswordSuccess("");

        // Validations
        if (!formData.currentPassword.trim()) {
            setPasswordError("Ingresa tu contraseña actual.");
            return;
        }
        if (!formData.newPassword.trim()) {
            setPasswordError("Ingresa la nueva contraseña.");
            return;
        }
        if (formData.newPassword.length < 6) {
            setPasswordError("La nueva contraseña debe tener al menos 6 caracteres.");
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setPasswordError("Las contraseñas no coinciden.");
            return;
        }

        try {
            const result = await triggerChangePassword({
                current_password: formData.currentPassword,
                password: formData.newPassword,
            }).unwrap();

            setPasswordSuccess(result?.message || "Contraseña actualizada correctamente.");
            setFormData(prev => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            }));
            setShowCurrentPassword(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);
        } catch (err: any) {
            const message = err?.data?.message || err?.message || "Error al cambiar la contraseña. Verifica tu contraseña actual.";
            setPasswordError(message);
        }
    }, [formData, triggerChangePassword]);
    
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
            case "firstName": return "Nombre(s)";
            case "lastName": return "Apellidos";
            case "phone": return "Celular";
            case "university": return "Universidad";
            default: return "";
        }
    }, []);

    // Memoized back handler
    const handleBack = useCallback(() => router.back(), [router]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
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
                        {formData.firstName} {formData.lastName}
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
                                    {formData.firstName || "Sin registrar"}
                                </Text>
                            </View>
                            <TouchableOpacity 
                                onPress={() => openEditModal("firstName", formData.firstName)}
                                style={styles.editButton}
                            >
                                <Edit2 size={18} color={editingField === "firstName" ? "#3b82f6" : "#000000"} />
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
                                    {formData.lastName || "Sin registrar"}
                                </Text>
                            </View>
                            <TouchableOpacity 
                                onPress={() => openEditModal("lastName", formData.lastName)}
                                style={styles.editButton}
                            >
                                <Edit2 size={18} color={editingField === "lastName" ? "#3b82f6" : "#000000"} />
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
                                    {formData.phone || "Sin registrar"}
                                </Text>
                            </View>
                            <TouchableOpacity 
                                onPress={() => openEditModal("phone", formData.phone)}
                                style={styles.editButton}
                            >
                                <Edit2 size={18} color={editingField === "phone" ? "#3b82f6" : "#000000"} />
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
                                    {formData.university || "Sin registrar"}
                                </Text>
                            </View>
                            <TouchableOpacity 
                                onPress={() => openEditModal("university", formData.university)}
                                style={styles.editButton}
                            >
                                <Edit2 size={18} color={editingField === "university" ? "#3b82f6" : "#000000"} />
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

                    {/* Error / Success messages */}
                    {passwordError ? (
                        <View style={{ backgroundColor: "#fee2e2", padding: 12, borderRadius: 10, marginTop: 10 }}>
                            <Text style={{ color: "#991b1b", fontSize: 13, fontWeight: "500" }}>{passwordError}</Text>
                        </View>
                    ) : null}
                    {passwordSuccess ? (
                        <View style={{ backgroundColor: "#dcfce7", padding: 12, borderRadius: 10, marginTop: 10 }}>
                            <Text style={{ color: "#166534", fontSize: 13, fontWeight: "500" }}>{passwordSuccess}</Text>
                        </View>
                    ) : null}

                    {/* Botón Cambiar Contraseña */}
                    <Pressable 
                        style={[
                            styles.saveButton, 
                            { backgroundColor: "#0284c7", marginTop: 14, opacity: isChangingPassword ? 0.7 : 1 }
                        ]}
                        onPress={handleChangePassword}
                        disabled={isChangingPassword}
                    >
                        {isChangingPassword ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <Text style={styles.saveButtonText}>Cambiar Contraseña</Text>
                        )}
                    </Pressable>
                </View>
                
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
        </SafeAreaView>
    );
}
