import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../components/ThemeContext";

import {
  ChevronRight,
  GraduationCap,
  Menu,
  MessageSquare,
  Paperclip,
  Plus,
  Send,
  Trash2,
  User
} from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatAgentScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH * 0.75)).current;
  const inputTranslateY = useRef(new Animated.Value(0)).current;

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: "1",
      title: "Cardiología",
      lastMessage: "Explícame sobre insuficiencia cardíaca...",
      timestamp: new Date(),
    },
    {
      id: "2",
      title: "Farmacología",
      lastMessage: "Cuáles son los efectos del propranolol...",
      timestamp: new Date(Date.now() - 86400000),
    },
    {
      id: "3",
      title: "Neurología",
      lastMessage: "Tipos de cefalea...",
      timestamp: new Date(Date.now() - 172800000),
    },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "¡Hola! Soy tu Instructor Médico, con más de 15 años de experiencia en docencia médica y preparación para exámenes de medicina.\n\nEstoy aquí para guiarte en tu preparación, resolver tus dudas y ayudarte a dominar los conceptos clave que necesitas para tu examen.\n\n¿En qué tema médico te gustaría que te ayude hoy?",
      timestamp: new Date(),
    },
  ]);
  const [suggestions] = useState<string[]>([
    "Explícame la insuficiencia cardíaca",
    "¿Cuáles son los efectos del propranolol?",
    "Tipos de cefalea y su diagnóstico",
    "Farmacología antihipertensiva",
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  // Función para hacer scroll al final
  const scrollToEnd = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Manejar el teclado
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardShow = Keyboard.addListener(showEvent, (e) => {
      const keyboardHeight = e.endCoordinates.height;
      // Mover el input hacia arriba exactamente la altura del teclado
      Animated.timing(inputTranslateY, {
        toValue: -keyboardHeight,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        scrollToEnd();
      });
    });

    const keyboardHide = Keyboard.addListener(hideEvent, () => {
      // Regresar el input a su posición original
      Animated.timing(inputTranslateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      keyboardShow.remove();
      keyboardHide.remove();
    };
  }, []);

  const toggleSidebar = () => {
    if (sidebarOpen) {
      Animated.timing(slideAnim, {
        toValue: -SCREEN_WIDTH * 0.75,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setSidebarOpen(false));
    } else {
      setSidebarOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleNewChat = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages([
      {
        id: "1",
        role: "assistant",
        content:
          "¡Hola! Soy tu Instructor Médico, con más de 15 años de experiencia en docencia médica y preparación para exámenes de medicina.\n\nEstoy aquí para guiarte en tu preparación, resolver tus dudas y ayudarte a dominar los conceptos clave que necesitas para tu examen.\n\n¿En qué tema médico te gustaría que te ayude hoy?",
        timestamp: new Date(),
      },
    ]);
    if (sidebarOpen) {
      toggleSidebar();
    }
    scrollToEnd();
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    
    // Cerrar el teclado después de enviar el mensaje
    Keyboard.dismiss();
    
    scrollToEnd();

    // Simulate assistant response
    setIsTyping(true);
    setTimeout(() => {
      const responses = [
        "Excelente pregunta. Como tu instructor médico con experiencia en docencia, te explico esto de manera clara y estructurada:\n\n**Fundamento teórico:** Este concepto se basa en principios fisiopatológicos que debes dominar. La comprensión de la fisiopatología es clave para el razonamiento clínico.\n\n**Aplicación clínica:** En la práctica, esto se traduce en:\n• Anamnesis dirigida y completa\n• Examen físico sistemático\n• Interpretación racional de estudios complementarios\n\n**Punto clave para tu examen:** Los examinadores valoran especialmente el razonamiento clínico secuencial. Siempre piensa en: ¿Qué debo preguntar? ¿Qué debo examinar? ¿Qué estudios solicito y por qué?\n\n¿Te gustaría que profundicemos en algún aspecto específico o que practiquemos con preguntas tipo examen?",
        "Muy buena pregunta. En mi experiencia preparando estudiantes para exámenes de medicina, este es un tema que frecuentemente genera confusión. Te lo explico paso a paso:\n\n**Concepto fundamental:** La base de este tema radica en entender la relación causa-efecto en el contexto clínico.\n\n**Estrategia de estudio recomendada:**\n1. Primero comprende la fisiopatología\n2. Luego asocia con la clínica\n3. Finalmente, practica con casos clínicos\n\n**Alta frecuencia en exámenes:** Este tipo de preguntas aparece en aproximadamente el 15-20% de los exámenes de opción múltiple. Los examinadores buscan evaluar tu capacidad de integrar conocimiento teórico con práctica clínica.\n\n¿Quieres que te prepare algunas preguntas de práctica sobre este tema específico?",
        "Perfecto, veo que estás trabajando en temas importantes para tu examen. Te felicito por tu dedicación.\n\n**Análisis desde la perspectiva del examinador:** Cuando veas una pregunta sobre este tema, los examinadores están evaluando:\n• Tu conocimiento de la fisiopatología\n• Tu capacidad de aplicar el conocimiento clínico\n• Tu razonamiento diagnóstico diferencial\n\n**Consejo de experto:** En exámenes de opción múltiple, cuando veas opciones que mencionan 'siempre' o 'nunca', desconfía. La medicina rara vez es absoluta.\n\n**Punto crítico:** Recuerda que el objetivo final es el bienestar del paciente. Todas tus decisiones clínicas deben orientarse hacia eso.\n\n¿Te gustaría que exploremos este tema con más profundidad o que practiquemos con casos clínicos?",
        "Excelente enfoque de estudio. Como instructor médico, veo que estás priorizando los temas correctos.\n\n**Perspectiva pedagógica:** Este tema es fundamental porque:\n• Es la base para entender patologías más complejas\n• Aparece transversalmente en múltiples especialidades\n• Es esencial para el razonamiento clínico\n\n**Metodología de estudio efectiva:**\n1. Estudia la teoría con comprensión, no memorización\n2. Relaciona con casos clínicos reales\n3. Practica con preguntas de examen\n4. Revisa tus errores y entiende por qué fallaste\n\n**Dato importante para tu examen:** Los exámenes modernos de medicina valoran más el proceso de razonamiento que la memorización pura. Los examinadores quieren ver cómo piensas, no solo qué sabes.\n\n¿Quieres que trabajemos juntos en este tema con ejercicios prácticos?",
      ];
      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: randomResponse,
        timestamp: new Date(),
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, assistantMessage]);
      scrollToEnd();
    }, 1500);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";

    return (
      <View
        style={[
          styles.messageContainer,
          isUser
            ? styles.userMessageContainer
            : styles.assistantMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={styles.assistantAvatarContainer}>
            <View style={styles.assistantAvatar}>
              <GraduationCap size={16} color="white" />
            </View>
            <Text style={[styles.assistantName, { color: "#1e40af" }]}>Instructor Médico</Text>
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
            {
              backgroundColor: isUser ? "#1e40af" : colors.card,
            },
          ]}
        >
          <View style={styles.messageContent}>
            <Text
              style={[
                styles.messageText,
                { color: isUser ? "white" : colors.text },
              ]}
            >
              {item.content}
            </Text>
          </View>
        </View>
        {isUser && (
          <View style={styles.userAvatarContainer}>
            <View style={styles.userAvatar}>
              <User size={16} color="white" />
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: "#ffffff" }]}
      edges={["top"]}
    >
      <View style={{ flex: 1 }}>
        {/* Sidebar */}
        {sidebarOpen && (
          <>
            <Animated.View
              style={[
                styles.sidebarOverlay,
                {
                  opacity: slideAnim.interpolate({
                    inputRange: [-SCREEN_WIDTH * 0.75, 0],
                    outputRange: [0, 0.5],
                  }),
                },
              ]}
            >
              <Pressable style={styles.overlayPressable} onPress={toggleSidebar} />
            </Animated.View>
            <Animated.View
              style={[
                styles.sidebar,
                {
                  backgroundColor: colors.card,
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              <View style={[styles.sidebarHeader, { borderBottomColor: colors.background }]}>
                <Text style={[styles.sidebarTitle, { color: "#1e40af" }]}>
                  Historial de Consultas
                </Text>
                <Pressable style={styles.sidebarCloseButton} onPress={toggleSidebar}>
                  <ChevronRight size={24} color={colors.text} />
                </Pressable>
              </View>
              <ScrollView style={styles.sidebarContent}>
                {chatSessions.map((session) => (
                  <Pressable
                    key={session.id}
                    style={[styles.chatSessionItem, { borderBottomColor: colors.background }]}
                  >
                    <MessageSquare size={16} color={colors.subtitle} />
                    <View style={styles.sessionInfo}>
                      <Text style={[styles.sessionTitle, { color: "#1e40af" }]}>
                        {session.title}
                      </Text>
                      <Text
                        style={[styles.sessionPreview, { color: colors.subtitle }]}
                        numberOfLines={1}
                      >
                        {session.lastMessage}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
              <Pressable
                style={[styles.newChatButton, { backgroundColor: "#1e40af" }]}
                onPress={handleNewChat}
              >
                <Plus size={20} color="white" />
                <Text style={styles.newChatText}>Nuevo Chat</Text>
              </Pressable>
            </Animated.View>
          </>
        )}

        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={toggleSidebar}>
            <Menu size={24} color="#1e293b" />
          </Pressable>
          <View style={styles.headerCenter}>
            <View style={styles.headerTitleRow}>
              <View>
                <Text style={[styles.headerTitle, { color: "#1e40af" }]}>Instructor Médico</Text>
                <Text style={[styles.headerSubtitle, { color: "#1e40af" }]}>Experto en Preparación Médica</Text>
              </View>
            </View>
          </View>
          <Pressable style={styles.newChatButtonSmall} onPress={handleNewChat}>
            <Trash2 size={20} color="#64748b" />
          </Pressable>
        </View>

        {/* Chat Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            scrollToEnd();
          }}
          onLayout={() => {
            scrollToEnd();
          }}
          ListFooterComponent={
            messages.length === 1 ? (
              <View style={styles.suggestionsContainer}>
                <Text style={[styles.suggestionsTitle, { color: "#1e40af" }]}>
                  Temas populares para preguntar:
                </Text>
                <View style={styles.suggestionsGrid}>
                  {suggestions.map((suggestion, index) => (
                    <Pressable
                      key={index}
                      style={styles.suggestionChip}
                      onPress={() => {
                        setInputText(suggestion);
                        inputRef.current?.focus();
                      }}
                    >
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null
          }
        />

        {/* Typing Indicator */}
        {isTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.typingBubble}>
              <View style={styles.typingDot} />
              <View style={[styles.typingDot, styles.typingDotMiddle]} />
              <View style={styles.typingDot} />
            </View>
          </View>
        )}

        {/* Input Area */}
        <Animated.View
          style={[
            styles.inputContainer,
            {
              transform: [{ translateY: inputTranslateY }],
              paddingBottom: Platform.OS === 'android' 
                ? Math.max(16, insets.bottom) 
                : 16,
            },
          ]}
        >
          <View style={styles.inputRow}>
            <Pressable style={styles.attachButton}>
              <Paperclip size={20} color="#64748b" />
            </Pressable>
            <View style={styles.inputWrapper}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Pregúntale a tu Instructor Médico..."
                placeholderTextColor="#94a3b8"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={1000}
                onFocus={() => {
                  setTimeout(() => {
                    scrollToEnd();
                  }, 300);
                }}
              />
            </View>
            <Pressable
              style={[
                styles.sendButton,
                inputText.trim() && styles.sendButtonActive,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Send
                size={20}
                color={inputText.trim() ? "white" : "#94a3b8"}
              />
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sidebarOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  overlayPressable: {
    flex: 1,
  },
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.75,
    zIndex: 20,
    paddingTop: 50,
  },
  sidebarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  sidebarCloseButton: {
    padding: 4,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e40af",
  },
  sidebarContent: {
    flex: 1,
    paddingTop: 8,
  },
  chatSessionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e40af",
  },
  sessionPreview: {
    fontSize: 13,
    marginTop: 2,
  },
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 37,
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  newChatText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },

  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1e40af",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  headerSubtitle: {
    fontSize: 12,
    color: "#1e40af",
    marginTop: 2,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e40af",
  },
  newChatButtonSmall: {
    padding: 8,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: "flex-end",
  },
  assistantMessageContainer: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "85%",
    padding: 14,
    borderRadius: 16,
  },

  userBubble: {
    borderBottomRightRadius: 4,
  },

  assistantBubble: {
    borderBottomLeftRadius: 4,
  },

  assistantAvatarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },

  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1e40af",
    justifyContent: "center",
    alignItems: "center",
  },

  assistantName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e40af",
  },

  userAvatarContainer: {
    alignItems: "flex-end",
    marginTop: 8,
  },

  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1e40af",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "white",
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },

  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },

  suggestionsTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#1e40af",
  },

  suggestionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  suggestionChip: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#93c5fd",
  },

  suggestionText: {
    fontSize: 13,
    color: "#1e40af",
    fontWeight: "500",
  },

  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    alignSelf: "flex-start",
    gap: 6,
  },

  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#94a3b8",
  },

  typingDotMiddle: {
    marginHorizontal: 4,
  },

  sendButtonActive: {
    backgroundColor: "#1e40af",
  },
  attachButton: {
    padding: 8,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
  },
  input: {
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomTabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  tabItem: {
    padding: 8,
  },
  tabAddButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1e40af",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -30,
  },
});