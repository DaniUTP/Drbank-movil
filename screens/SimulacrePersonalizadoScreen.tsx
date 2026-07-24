import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useTheme } from "../components/ThemeContext";

import {
    AlertCircle,
    ArrowLeft,
    Brain,
    CheckCircle,
    ChevronRight,
    Play,
    Target,
    TrendingUp
} from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Datos del usuario (simulados)
const USER_DATA = {
    nombre: "Juan",
    erroresGraves: 45,
    erroresLeves: 28,
    totalErrores: 73
};

export default function SimulacrePersonalizadoScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [isStarting, setIsStarting] = useState(false);

    // Animación de entrada
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(50)).current;
    const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 5,
                tension: 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleStartSimulacro = () => {
        setIsStarting(true);
        // Aquí iría la lógica para iniciar el simulacro
        setTimeout(() => {
            setIsStarting(false);
            router.push("/simulacre-generator");
        }, 1500);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card }]}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    Simulacro Personalizado
                </Text>
                <View style={styles.headerPlaceholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Welcome Section */}
                <Animated.View style={[
                    styles.welcomeSection,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}>
                                        <Text style={[styles.welcomeTitle, { color: colors.text }]}>
                        Hola, <Text style={{ color: "#0284c7" }}>{USER_DATA.nombre}</Text> 👋
                    </Text>
                    <Text style={[styles.welcomeSubtitle, { color: colors.subtitle }]}>
                        ¿Listo para un desafío personalizado?
                    </Text>
                </Animated.View>

                {/* Info Cards */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
                    {/* Main Info Card */}
                    <View style={[styles.mainCard, { backgroundColor: colors.card }]}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.cardIconContainer, { backgroundColor: "#e0e7ff" }]}>
                                <Brain size={24} color="#4f46e5" />
                            </View>
                            <Text style={[styles.cardTitle, { color: colors.text }]}>
                                Tu Simulacro Inteligente
                            </Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.distributionContainer}>
                            <View style={styles.distributionItem}>
                                <View style={[styles.distributionBadge, { backgroundColor: "#fef2f2" }]}>
                                    <AlertCircle size={18} color="#ef4444" />
                                </View>
                                <View style={styles.distributionInfo}>
                                    <Text style={[styles.distributionLabel, { color: colors.subtitle }]}>
                                        Errores Graves
                                    </Text>
                                    <Text style={[styles.distributionValue, { color: "#ef4444" }]}>
                                        60%
                                    </Text>
                                </View>
                                <Text style={[styles.distributionCount, { color: colors.subtitle }]}>
                                    {Math.round(USER_DATA.erroresGraves * 0.6)} preguntas
                                </Text>
                            </View>

                            <View style={styles.distributionBar}>
                                <View style={[styles.barGrave, { width: "60%" }]} />
                                <View style={[styles.barLeve, { width: "40%" }]} />
                            </View>

                            <View style={styles.distributionItem}>
                                <View style={[styles.distributionBadge, { backgroundColor: "#fefce8" }]}>
                                    <TrendingUp size={18} color="#eab308" />
                                </View>
                                <View style={styles.distributionInfo}>
                                    <Text style={[styles.distributionLabel, { color: colors.subtitle }]}>
                                        Errores Leves
                                    </Text>
                                    <Text style={[styles.distributionValue, { color: "#eab308" }]}>
                                        40%
                                    </Text>
                                </View>
                                <Text style={[styles.distributionCount, { color: colors.subtitle }]}>
                                    {Math.round(USER_DATA.erroresLeves * 0.4)} preguntas
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.totalBadge, { backgroundColor: "#f0fdf4" }]}>
                            <Target size={16} color="#16a34a" />
                            <Text style={[styles.totalText, { color: "#16a34a" }]}>
                                Total: {Math.round(USER_DATA.erroresGraves * 0.6) + Math.round(USER_DATA.erroresLeves * 0.4)} preguntas
                            </Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Features List */}
                <Animated.View style={[styles.featuresSection, { opacity: fadeAnim }]}>
                    <Text style={[styles.featuresTitle, { color: colors.text }]}>
                        ¿Qué incluye este simulacro?
                    </Text>

                    <View style={[styles.featureItem, { backgroundColor: colors.card }]}>
                        <View style={[styles.featureIcon, { backgroundColor: "#f0fdf4" }]}>
                            <CheckCircle size={20} color="#16a34a" />
                        </View>
                        <View style={styles.featureContent}>
                            <Text style={[styles.featureTitle, { color: colors.text }]}>
                                Análisis de tu historial
                            </Text>
                            <Text style={[styles.featureDesc, { color: colors.subtitle }]}>
                                Basado en tus últimos exámenes y errores
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.featureItem, { backgroundColor: colors.card }]}>
                        <View style={[styles.featureIcon, { backgroundColor: "#fef3c7" }]}>
                            <Brain size={20} color="#d97706" />
                        </View>
                        <View style={styles.featureContent}>
                            <Text style={[styles.featureTitle, { color: colors.text }]}>
                                Preguntas adaptativas
                            </Text>
                            <Text style={[styles.featureDesc, { color: colors.subtitle }]}>
                                Enfocadas en tus áreas de mejora
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.featureItem, { backgroundColor: colors.card }]}>
                        <View style={[styles.featureIcon, { backgroundColor: "#e0e7ff" }]}>
                            <TrendingUp size={20} color="#4f46e5" />
                        </View>
                        <View style={styles.featureContent}>
                            <Text style={[styles.featureTitle, { color: colors.text }]}>
                                Seguimiento de progreso
                            </Text>
                            <Text style={[styles.featureDesc, { color: colors.subtitle }]}>
                                Compara tu rendimiento anterior
                            </Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Start Button */}
                <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
                    <TouchableOpacity
                        style={[styles.startButton, { backgroundColor: "#0284c7" }]}
                        onPress={handleStartSimulacro}
                        activeOpacity={0.8}
                        disabled={isStarting}
                    >
                        {isStarting ? (
                            <Animated.View style={styles.loadingContainer}>
                                <Animated.View style={[styles.loadingDot, { backgroundColor: "white" }]} />
                                <Animated.View style={[styles.loadingDot, { backgroundColor: "white" }]} />
                                <Animated.View style={[styles.loadingDot, { backgroundColor: "white" }]} />
                            </Animated.View>
                        ) : (
                            <>
                                <Play size={22} color="white" fill="white" />
                                <Text style={styles.startButtonText}>
                                    Iniciar Simulacro
                                </Text>
                                <ChevronRight size={22} color="white" />
                            </>
                        )}
                    </TouchableOpacity>

                    <Text style={[styles.disclaimer, { color: colors.subtitle }]}>
                        Al iniciar, se generarán preguntas personalizadas basadas en tu historial de errores
                    </Text>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    headerPlaceholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    welcomeSection: {
        alignItems: "center",
        marginBottom: 24,
        marginTop: 10,
    },
    greetingBadge: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    welcomeTitle: {
        fontSize: 26,
        fontWeight: "700",
        marginBottom: 8,
        textAlign: "center",
    },
    welcomeSubtitle: {
        fontSize: 16,
        textAlign: "center",
    },
    mainCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    cardIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "600",
        flex: 1,
    },
    divider: {
        height: 1,
        backgroundColor: "#e2e8f0",
        marginBottom: 16,
    },
    distributionContainer: {
        marginBottom: 16,
    },
    distributionItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    distributionBadge: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    distributionInfo: {
        flex: 1,
    },
    distributionLabel: {
        fontSize: 13,
    },
    distributionValue: {
        fontSize: 18,
        fontWeight: "700",
    },
    distributionCount: {
        fontSize: 13,
    },
    distributionBar: {
        flexDirection: "row",
        height: 8,
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 16,
    },
    barGrave: {
        backgroundColor: "#ef4444",
    },
    barLeve: {
        backgroundColor: "#eab308",
    },
    totalBadge: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    totalText: {
        fontSize: 15,
        fontWeight: "600",
    },
    featuresSection: {
        marginBottom: 24,
    },
    featuresTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 16,
    },
    featureItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 14,
        marginBottom: 12,
    },
    featureIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 2,
    },
    featureDesc: {
        fontSize: 13,
    },
    buttonContainer: {
        alignItems: "center",
    },
    startButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 16,
        width: "100%",
        gap: 10,
        shadowColor: "#0284c7",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    startButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "700",
    },
    loadingContainer: {
        flexDirection: "row",
        gap: 6,
    },
    loadingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    disclaimer: {
        fontSize: 12,
        textAlign: "center",
        marginTop: 16,
        paddingHorizontal: 20,
    },
});
