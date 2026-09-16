import { useLazyQuestionByThemeQuery } from "@/services/question/question.rtkq";
import { useLazyStudentProgressQuery } from "@/services/studentProgress/student-progress.rtkq";
import type { StudentProgressResponseDTO } from "@/types/studentProgress/student-progress.dto";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Modal from "../../common/Modal";
import ThemeToggle from "../../common/ThemeToggle";
import { useTheme } from "../../common/ThemeContext";

export default function StudyModuleScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const horizontalMargin = 20;
  const videoWidth = Math.max(0, screenWidth - horizontalMargin * 2);
  const videoHeight = videoWidth * (16 / 9);
  const params = useLocalSearchParams<{ title?: string; area?: string; videoUrl?: string; themeUuid?: string }>();
  const [completed, setCompleted] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [videoStatus, setVideoStatus] = useState<"idle" | "loading" | "readyToPlay" | "error">("loading");
  const [hasVideoUrl, setHasVideoUrl] = useState(Boolean(params.videoUrl));
  const [isRenewingVideo, setIsRenewingVideo] = useState(false);
  const [fetchQuestions] = useLazyQuestionByThemeQuery();
  const [refreshProgress] = useLazyStudentProgressQuery();
  const renewalAttemptedRef = useRef(false);
  const renewalInProgressRef = useRef(false);
  const friendlyVideoError = renewalAttemptedRef.current
    ? "No se pudo renovar el acceso al video. Inténtalo nuevamente."
    : "No fue posible reproducir este contenido. Inténtalo nuevamente más tarde.";
  // Keep one player instance. Signed URLs are replaced imperatively so playback
  // position can be restored and changing a URL cannot recreate retry state.
  const player = useVideoPlayer(null, (instance) => { instance.loop = false; });

  const findTopicVideoUrl = useCallback((progress: StudentProgressResponseDTO) => {
    if (!params.themeUuid) return null;
    for (const calendarDay of progress.calendar ?? []) {
      const topic = calendarDay.topics?.find(item => item.theme_uuid === params.themeUuid);
      if (topic) return topic.video_url || null;
    }
    return null;
  }, [params.themeUuid]);

  const renewVideoAccess = useCallback(async () => {
    if (!params.themeUuid || renewalInProgressRef.current) return false;
    if (renewalAttemptedRef.current) return false;

    renewalAttemptedRef.current = true;
    renewalInProgressRef.current = true;
    setIsRenewingVideo(true);
    const previousPosition = player.currentTime;

    try {
      // preferCacheValue=false forces a new request and therefore a fresh signed URL.
      const progress = await refreshProgress(undefined, false).unwrap();
      const renewedUrl = findTopicVideoUrl(progress);
      if (!renewedUrl) {
        setHasVideoUrl(false);
        setVideoStatus("error");
        return false;
      }

      setHasVideoUrl(true);
      setVideoStatus("loading");
      await player.replaceAsync({ uri: renewedUrl, contentType: "progressive", useCaching: false });
      if (previousPosition > 0) player.currentTime = previousPosition;
      player.play();
      return true;
    } catch {
      setVideoStatus("error");
      return false;
    } finally {
      renewalInProgressRef.current = false;
      setIsRenewingVideo(false);
    }
  }, [findTopicVideoUrl, params.themeUuid, player, refreshProgress]);

  // Start with the exact signed URL received through navigation. It is renewed
  // only if the video server rejects it with HTTP 401 or 403.
  useEffect(() => {
    if (!params.videoUrl) {
      setHasVideoUrl(false);
      setVideoStatus("error");
      return;
    }
    setHasVideoUrl(true);
    setVideoStatus("loading");
    void player.replaceAsync({ uri: params.videoUrl, contentType: "progressive", useCaching: false })
      .catch(() => setVideoStatus("error"));
  }, [params.videoUrl, player]);

  useEffect(() => {
    if (!hasVideoUrl && !isRenewingVideo) {
      setVideoStatus("error");
      return undefined;
    }
    const endSubscription = player.addListener("playToEnd", () => setCompleted(true));
    const statusSubscription = player.addListener("statusChange", ({ status, error }) => {
      setVideoStatus(status);
      const errorMessage = error?.message ?? "";
      if (status === "error" && /(?:401|403)/.test(errorMessage)) {
        void renewVideoAccess();
      }
    });
    setVideoStatus(player.status);
    return () => {
      endSubscription.remove();
      statusSubscription.remove();
    };
  }, [hasVideoUrl, isRenewingVideo, player, renewVideoAccess]);

  const startPractice = async () => {
    if (!completed || !params.themeUuid) return;
    player.pause();
    setShowLoading(true);
    try {
      const questions = await fetchQuestions({ id: params.themeUuid }).unwrap();
      router.push({ pathname: "/questions", params: {
        questions: JSON.stringify(questions), examType: "Estudio por Tema", theme: params.title,
        area: params.area, themeUuid: params.themeUuid, sourceKey: "by_topic",
        examMode: "Resultados al final", questionCount: String(questions.length), timeLimit: "60", fromCalendar: "true",
      }});
    } finally { setShowLoading(false); }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={[styles.back, { backgroundColor: colors.themeButton }]}><ArrowLeft size={22} color={colors.text} /></Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Módulo de estudio</Text><ThemeToggle />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.moduleHeading}>
          <Text style={styles.eyebrow}>MÓDULO DE APRENDIZAJE</Text>
          <Text style={[styles.title, { color: colors.text }]}>{params.title}</Text>
        </View>
        <View style={[styles.playerCard, { width: videoWidth, height: videoHeight }]}>
          <VideoView
            player={player}
            style={styles.player}
            nativeControls
            contentFit="contain"
            surfaceType="textureView"
            fullscreenOptions={{ enable: true }}
          />
          {(videoStatus === "loading" || videoStatus === "idle" || isRenewingVideo) && (
            <View style={styles.playerOverlay}><ActivityIndicator size="large" color="#38bdf8" /><Text style={styles.playerOverlayText}>{isRenewingVideo ? "Renovando acceso..." : "Cargando video..."}</Text></View>
          )}
          {videoStatus === "error" && (
            <View style={styles.playerOverlay}><Text style={styles.playerErrorTitle}>Video no disponible</Text><Text style={styles.playerErrorText}>{friendlyVideoError}</Text></View>
          )}
        </View>
        <View style={styles.navigationActions}>
          <Pressable onPress={() => router.back()} style={[styles.backAction, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}>
            <ChevronLeft size={20} color={colors.text} />
            <Text style={[styles.backActionText, { color: colors.text }]}>Regresar</Text>
          </Pressable>
          <Pressable disabled={!completed} onPress={startPractice} style={[styles.continueAction, !completed && styles.continueActionDisabled, !completed && { backgroundColor: colors.themeButton }]}>
            <Text style={[styles.continueActionText, !completed && styles.continueActionTextDisabled, !completed && { color: colors.subtitle }]}>Continuar</Text>
            <ChevronRight size={20} color={completed ? "#ffffff" : "#94a3b8"} />
          </Pressable>
        </View>
        {!completed && <Text style={[styles.completionHint, { color: colors.subtitle }]}>Completa el video para continuar al simulacro.</Text>}
      </ScrollView>
      <Modal visible={showLoading} onClose={() => {}} title="Preparando la práctica" showFooter={false}><ActivityIndicator size="large" color="#0284c7" /></Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, header: { height: 58, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  back: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "#f1f5f9" }, headerTitle: { fontSize: 16, fontWeight: "800" }, headerSpacer: { width: 38 },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 }, moduleHeading: { paddingBottom: 14 }, eyebrow: { color: "#0284c7", fontSize: 10, fontWeight: "900", letterSpacing: 1.1 }, title: { marginTop: 4, color: "#0f172a", fontSize: 24, lineHeight: 29, fontWeight: "900" },
  playerCard: { position: "relative", alignSelf: "center", borderRadius: 16, backgroundColor: "#000", shadowColor: "#0f172a", shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 6, overflow: "hidden" }, player: { width: "100%", height: "100%", backgroundColor: "#000" }, playerOverlay: { ...StyleSheet.absoluteFillObject, padding: 24, alignItems: "center", justifyContent: "center", backgroundColor: "#0f172a" }, playerOverlayText: { color: "#cbd5e1", marginTop: 10, fontSize: 13, fontWeight: "600" }, playerErrorTitle: { color: "#ffffff", fontSize: 15, fontWeight: "800", textAlign: "center" }, playerErrorText: { color: "#94a3b8", marginTop: 6, fontSize: 11, lineHeight: 16, textAlign: "center" },
  navigationActions: { marginTop: 16, flexDirection: "row", gap: 10 }, backAction: { flex: 1, minHeight: 54, borderRadius: 15, borderWidth: 1, borderColor: "#cbd5e1", flexDirection: "row", gap: 5, alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff" }, backActionText: { color: "#334155", fontSize: 15, fontWeight: "800" }, continueAction: { flex: 1, minHeight: 54, borderRadius: 15, flexDirection: "row", gap: 5, alignItems: "center", justifyContent: "center", backgroundColor: "#0284c7" }, continueActionDisabled: { backgroundColor: "#f1f5f9" }, continueActionText: { color: "#ffffff", fontSize: 15, fontWeight: "800" }, continueActionTextDisabled: { color: "#94a3b8" }, completionHint: { marginTop: 10, color: "#64748b", fontSize: 12, lineHeight: 17, textAlign: "center" },
});
