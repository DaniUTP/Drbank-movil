import { useRouter } from "expo-router";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import {
  ArrowLeft,
  Calendar,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  FileText,
  Search,
  User,
  Video
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import {
  AgendaEntry,
  Calendar as MonthCalendar,
  LocaleConfig,
} from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import Modal from "../../common/Modal";
import ThemeToggle from "../../common/ThemeToggle";
import { useTheme } from "../../common/ThemeContext";
import { useDoctorAvailabilityQuery, useDoctorQuery } from "../../services/doctor/doctor.rtkq";
import {
  useAcademicAdvisoriesQuery,
  useAcademicAdvisoresHoldMutation,
  useReleaseMeetingSlotMutation,
  useRegisterMeetingMutation,
} from "../../services/student/student.rtkq";
import { AcademicAdvisoriesResponseDTO } from "../../types/student/student.dto";
import { DoctorAvailabilitySlotDTO } from "../../types/doctor/doctor.dto";

LocaleConfig.locales["es"] = {
  monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
  monthNamesShort: ["Ene.", "Feb.", "Mar.", "Abr.", "May.", "Jun.", "Jul.", "Ago.", "Sep.", "Oct.", "Nov.", "Dic."],
  dayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
  dayNamesShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
  today: "Hoy"
};
LocaleConfig.defaultLocale = "es";

type AgendaItemCustom = AgendaEntry & {
  id: string;
  time: string;
  duration: string;
  title: string;
  detail: string;
  day: string;
  date: string;
  doctorName?: string;
  doctorSpecialty?: string;
  meetingUrl?: string;
  scheduledTimestamp: number;
};

type SimpleDayAgenda = {
  date?: string;
  day?: string;
  reservation?: AgendaItemCustom;
};

type SimpleReservationListProps = {
  items?: Record<string, AgendaEntry[]>;
};

type AgendaRow = {
  key: string;
  kind: "empty" | "entry";
  date: string;
  entries?: AgendaItemCustom[];
};

const PERU_TZ = 'America/Lima';
const NO_APPOINTMENT_LABEL = "Sin citas programadas";

// Paleta Celastito DrBank Pro
const PRIMARY_BLUE = "#0284c7";
const PRIMARY_BLUE_LIGHT = "#f0f9ff";
const PRIMARY_BLUE_BORDER = "#bae6fd";
const PRIMARY_BLUE_DARK = "#0369a1";

function getPeruDateKey(date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: PERU_TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const obj: Record<string, string> = {};
  parts.forEach(({ type, value }) => { obj[type] = value; });
  return `${obj.year}-${obj.month}-${obj.day}`;
}

function getDateKeyParts(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return { year, month, day };
}

function addDaysToDateKey(dateKey: string, days: number): string {
  const { year, month, day } = getDateKeyParts(dateKey);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function buildAgendaItems(advisories: AcademicAdvisoriesResponseDTO[]): Record<string, AgendaItemCustom[]> {
  const result: Record<string, AgendaItemCustom[]> = {};

  advisories.forEach((advisory, index) => {
    const scheduledAt = new Date(
      /(?:Z|[+-]\d{2}:?\d{2})$/.test(advisory.scheduled_at)
        ? advisory.scheduled_at
        : `${advisory.scheduled_at.replace(" ", "T")}-05:00`,
    );
    if (Number.isNaN(scheduledAt.getTime())) return;

    const date = getPeruDateKey(scheduledAt);
    const time = new Intl.DateTimeFormat("es-PE", {
      timeZone: PERU_TZ,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(scheduledAt);

    const item: AgendaItemCustom = {
      id: `${advisory.scheduled_at}-${index}`,
      name: "Asesoría académica",
      time,
      duration: `${advisory.duration_minutes} min`,
      title: "Asesoría académica",
      detail: advisory.reason,
      doctorName: advisory.doctor_name,
      doctorSpecialty: advisory.doctor_specialty,
      meetingUrl: advisory.meeting_url,
      scheduledTimestamp: scheduledAt.getTime(),
      height: 80,
      day: date,
      date,
    };

    result[date] = [...(result[date] ?? []), item];
  });

  Object.values(result).forEach((entries) => {
    entries.sort((first, second) => first.scheduledTimestamp - second.scheduledTimestamp);
  });

  return result;
}

const ES_WEEKDAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const ES_MONTH_LONG = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function formatDayHeader(dateStr: string | undefined): string {
  if (!dateStr) return "";
  const { year, month, day } = getDateKeyParts(dateStr);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return `${ES_WEEKDAY_SHORT[weekday]} ${day}`;
}

function formatFullDate(dateStr: string | undefined): string {
  if (!dateStr) return "";
  const { month, day } = getDateKeyParts(dateStr);
  return `${day} de ${ES_MONTH_LONG[month - 1]}`;
}

type MeetingDoctor = { id: number; name: string; specialty: string };
type MeetingDay = { date: string; label: string; dayNumber: number; isPast: boolean };
type RegistrationStatus = "loading" | "success" | "error";
type CurrentMeetingHold = {
  holdToken: string;
  expiresAt: string;
  doctorId: number;
  scheduledAt: string;
};

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
}

function buildMeetingDays(baseDateKey: string, dayCount: number): MeetingDay[] {
  return Array.from({ length: dayCount }, (_, index) => {
    const dayOffset = index;
    const dateKey = addDaysToDateKey(baseDateKey, dayOffset);
    const isPast = dateKey < baseDateKey;
    return {
      date: dateKey,
      label: formatDayHeader(dateKey).split(" ")[0],
      dayNumber: getDateKeyParts(dateKey).day,
      isPast,
    };
  });
}

function formatAvailabilityTime(value: string): string {
  const time = value.match(/\d{2}:\d{2}/)?.[0];
  return time ?? value;
}

function toPeruTimestamp(date: string, time: string): string {
  const normalizedTime = time.match(/\d{2}:\d{2}(?::\d{2})?/)?.[0] ?? time;
  const timeWithSeconds = normalizedTime.length === 5 ? `${normalizedTime}:00` : normalizedTime;
  return `${date}T${timeWithSeconds}-05:00`;
}

function parsePeruDateTime(value: string): number {
  const normalized = value.trim().replace(" ", "T");
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized);
  return new Date(hasTimezone ? normalized : `${normalized}-05:00`).getTime();
}

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(Math.max(0, totalSeconds) / 60);
  const seconds = Math.max(0, totalSeconds) % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getMeetingRequestErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "No se recibió una respuesta válida del servidor.";
  }

  const requestError = error as {
    status?: number | string;
    data?: unknown;
    error?: string;
  };

  if (typeof requestError.data === "string" && requestError.data.trim()) {
    return requestError.data;
  }

  if (requestError.data && typeof requestError.data === "object") {
    const response = requestError.data as {
      message?: unknown;
      error?: unknown;
      errors?: Record<string, unknown>;
    };
    if (typeof response.message === "string" && response.message.trim()) return response.message;
    if (typeof response.error === "string" && response.error.trim()) return response.error;
    if (response.errors && typeof response.errors === "object") {
      const validationMessages = Object.values(response.errors)
        .flatMap((value) => Array.isArray(value) ? value : [value])
        .filter((value): value is string => typeof value === "string" && !!value.trim());
      if (validationMessages.length > 0) return validationMessages.join("\n");
    }
  }

  if (requestError.status === "TIMEOUT_ERROR") {
    return "La solicitud está tardando más de lo esperado. Verifica el servicio e inténtalo nuevamente.";
  }

  if (typeof requestError.error === "string" && requestError.error.trim()) {
    return requestError.error;
  }

  return "No se pudo obtener el detalle del error enviado por el servidor.";
}

function getMeetingRequestErrorTitle(error: unknown, conflictTitle: string): string {
  const status = error && typeof error === "object"
    ? (error as { status?: number | string }).status
    : undefined;

  switch (status) {
    case 400: return "Datos inválidos";
    case 401: return "Sesión vencida";
    case 409: return conflictTitle;
    case 422: return "Revisa los datos";
    case 500: return "Error interno";
    default: return "No se pudo completar la solicitud";
  }
}

export default function RequestMedicalAssistanceScreen() {
  const { colors, darkMode } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const isScreenFocused = useIsFocused();
  const today = getPeruDateKey();
  const {
    data: academicAdvisories = [],
    isLoading: isLoadingAdvisories,
    isError: isAdvisoriesError,
    refetch: refetchAdvisories,
  } = useAcademicAdvisoriesQuery();
  const [createMeetingHold, { isLoading: isCreatingHold }] = useAcademicAdvisoresHoldMutation();
  const [releaseMeetingSlot, { isLoading: isReleasingHold }] = useReleaseMeetingSlotMutation();
  const [registerMeeting, { isLoading: isRegisteringMeeting }] = useRegisterMeetingMutation();

  const [selectedDate, setSelectedDate] = useState(today);
  const [agendaStartDate, setAgendaStartDate] = useState(today);
  const [meetingModalVisible, setMeetingModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [registrationModalVisible, setRegistrationModalVisible] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>("loading");
  const [registrationTitle, setRegistrationTitle] = useState("Agendando reunión");
  const [registrationMessage, setRegistrationMessage] = useState("");
  
  const [selectedAgendaItem, setSelectedAgendaItem] = useState<AgendaItemCustom | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDescription, setMeetingDescription] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [currentHold, setCurrentHold] = useState<CurrentMeetingHold | null>(null);
  const [holdSecondsRemaining, setHoldSecondsRemaining] = useState(0);
  const [holdingScheduledAt, setHoldingScheduledAt] = useState<string | null>(null);
  const [meetingEndTime, setMeetingEndTime] = useState("");
  const [calendarExpanded, setCalendarExpanded] = useState(false);
  const [visibleDayCount, setVisibleDayCount] = useState(14);
  const [isLoadingMoreDays, setIsLoadingMoreDays] = useState(false);
  const [visibleMeetingDayCount, setVisibleMeetingDayCount] = useState(14);
  const [isLoadingMoreMeetingDays, setIsLoadingMoreMeetingDays] = useState(false);
  const loadMoreTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const meetingDaysLoadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const agendaListRef = useRef<FlatList<AgendaRow>>(null);
  const holdRequestInFlight = useRef(false);
  const registerRequestInFlight = useRef(false);
  const currentHoldRef = useRef<CurrentMeetingHold | null>(null);
  const releaseInFlightTokenRef = useRef<string | null>(null);
  const flowConfirmedRef = useRef(false);
  const availabilityConflictHandledRef = useRef(false);
  const {
    data: doctorsData = [],
    isLoading: isLoadingDoctors,
    isError: isDoctorsError,
    refetch: refetchDoctors,
  } = useDoctorQuery(undefined, { skip: !meetingModalVisible });
  const meetingDoctors = useMemo<MeetingDoctor[]>(
    () => doctorsData.map((doctor) => ({
      id: doctor.id,
      name: doctor.doctor_name,
      specialty: doctor.specialty,
    })),
    [doctorsData],
  );
  const filteredMeetingDoctors = useMemo(() => {
    const search = normalizeSearchText(doctorSearch.trim());
    if (!search) return meetingDoctors;

    return meetingDoctors.filter((doctor) =>
      normalizeSearchText(`${doctor.name} ${doctor.specialty}`).includes(search),
    );
  }, [doctorSearch, meetingDoctors]);
  const selectAgendaDate = useCallback((dateKey: string) => {
    const nextDate = dateKey < today ? today : dateKey;
    setSelectedDate(nextDate);
    setAgendaStartDate(nextDate);
    setVisibleDayCount(14);
  }, [today]);
  const onVisibleAgendaRowsChanged = useRef(({ viewableItems }: {
    viewableItems: { item: AgendaRow }[];
  }) => {
    const firstVisibleDate = viewableItems.find(({ item }) => item.date)?.item.date;
    if (firstVisibleDate) setSelectedDate(firstVisibleDate);
  }).current;
  const agendaViewabilityConfig = useRef({ itemVisiblePercentThreshold: 55 }).current;

  const agendaItems = useMemo<Record<string, AgendaItemCustom[]>>(
    () => buildAgendaItems(academicAdvisories),
    [academicAdvisories],
  );
  const visibleWeek = useMemo(() => {
    const { year, month, day } = getDateKeyParts(selectedDate);
    const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    const weekStart = addDaysToDateKey(selectedDate, -weekday);
    return Array.from({ length: 7 }, (_, index) => addDaysToDateKey(weekStart, index));
  }, [selectedDate]);
  const selectedMonthLabel = useMemo(() => {
    const { year, month } = getDateKeyParts(selectedDate);
    return `${ES_MONTH_LONG[month - 1]} ${year}`;
  }, [selectedDate]);
  const meetingDays = useMemo(
    () => selectedDoctorId !== null
      ? buildMeetingDays(today, visibleMeetingDayCount).filter((day) => day.date >= today)
      : [],
    [today, selectedDoctorId, visibleMeetingDayCount],
  );
  const selectedDoctor = meetingDoctors.find((doctor) => doctor.id === selectedDoctorId);
  const {
    currentData: doctorAvailability,
    isLoading: isLoadingAvailabilityInitially,
    isFetching: isLoadingAvailability,
    isError: isAvailabilityError,
    error: availabilityError,
    refetch: refetchAvailability,
  } = useDoctorAvailabilityQuery(
    { doctor_id: selectedDoctorId!, date: meetingDate },
    {
      skip: !isScreenFocused || selectedDoctorId === null || !meetingDate,
      pollingInterval: 10000,
      skipPollingIfUnfocused: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
    },
  );
  const isAvailabilityLoading = isLoadingAvailabilityInitially || isLoadingAvailability;
  const availableSlots = doctorAvailability?.slots ?? [];

  useEffect(() => () => {
    if (loadMoreTimer.current) clearTimeout(loadMoreTimer.current);
    if (meetingDaysLoadTimer.current) clearTimeout(meetingDaysLoadTimer.current);
  }, []);

  const clearHoldState = useCallback(() => {
    currentHoldRef.current = null;
    setCurrentHold(null);
    setHoldSecondsRemaining(0);
    setMeetingTime("");
    setMeetingEndTime("");
  }, []);

  const refetchCurrentAvailability = useCallback(() => {
    if (!isScreenFocused || selectedDoctorId === null || !meetingDate) return;
    try {
      void refetchAvailability();
    } catch {
      // The query may have been unsubscribed while navigating away.
    }
  }, [isScreenFocused, meetingDate, refetchAvailability, selectedDoctorId]);

  const releaseCurrentHold = useCallback(async () => {
    const holdToRelease = currentHoldRef.current;
    if (!holdToRelease?.holdToken) return;

    // Clear synchronously before the request so repeated navigation events
    // cannot release the same token twice.
    clearHoldState();

    if (releaseInFlightTokenRef.current === holdToRelease.holdToken) return;
    releaseInFlightTokenRef.current = holdToRelease.holdToken;

    let releaseTimeout: ReturnType<typeof setTimeout> | null = null;
    try {
      await Promise.race([
        releaseMeetingSlot(holdToRelease.holdToken).unwrap(),
        new Promise<never>((_, reject) => {
          releaseTimeout = setTimeout(() => reject(new Error("Release timeout")), 5000);
        }),
      ]);
    } catch (error) {
      console.warn("No fue posible liberar el horario", error);
      refetchCurrentAvailability();
    } finally {
      if (releaseTimeout) clearTimeout(releaseTimeout);
      if (releaseInFlightTokenRef.current === holdToRelease.holdToken) {
        releaseInFlightTokenRef.current = null;
      }
    }
  }, [clearHoldState, refetchCurrentAvailability, releaseMeetingSlot]);

  useEffect(() => {
    if (!currentHold) return;

    const updateCountdown = () => {
      const expiresAt = parsePeruDateTime(currentHold.expiresAt);
      const secondsRemaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setHoldSecondsRemaining(secondsRemaining);

      if (secondsRemaining === 0) {
        clearHoldState();
        setStep(2);
        setRegistrationTitle("Reserva vencida");
        setRegistrationStatus("error");
        setRegistrationMessage("La reserva temporal venció. Selecciona otro horario disponible.");
        setRegistrationModalVisible(true);
        refetchCurrentAvailability();
      }
    };

    updateCountdown();
    const countdownTimer = setInterval(updateCountdown, 1000);
    return () => clearInterval(countdownTimer);
  }, [clearHoldState, currentHold, refetchCurrentAvailability]);

  useEffect(() => {
    if (!isAvailabilityError) {
      availabilityConflictHandledRef.current = false;
      return;
    }

    const requestError = availabilityError as { status?: number | string } | undefined;
    if (requestError?.status !== 409 || availabilityConflictHandledRef.current) return;

    availabilityConflictHandledRef.current = true;
    clearHoldState();
    setStep(2);
    setRegistrationTitle("Horario no disponible");
    setRegistrationStatus("error");
    setRegistrationMessage(getMeetingRequestErrorMessage(availabilityError));
    setRegistrationModalVisible(true);
    refetchCurrentAvailability();
  }, [availabilityError, clearHoldState, isAvailabilityError, refetchCurrentAvailability]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (event) => {
      if (flowConfirmedRef.current || !currentHoldRef.current) return;

      event.preventDefault();
      void (async () => {
        await releaseCurrentHold();
        navigation.dispatch(event.data.action);
      })();
    });

    return unsubscribe;
  }, [navigation, releaseCurrentHold]);

  useEffect(() => () => {
    const holdToRelease = currentHoldRef.current;
    if (
      flowConfirmedRef.current
      || !holdToRelease?.holdToken
      || releaseInFlightTokenRef.current === holdToRelease.holdToken
    ) return;

    currentHoldRef.current = null;
    releaseInFlightTokenRef.current = holdToRelease.holdToken;
    void releaseMeetingSlot(holdToRelease.holdToken);
  }, [releaseMeetingSlot]);

  const loadMoreMeetingDays = useCallback(() => {
    if (isLoadingMoreMeetingDays || visibleMeetingDayCount >= 365) return;
    setIsLoadingMoreMeetingDays(true);
    meetingDaysLoadTimer.current = setTimeout(() => {
      setVisibleMeetingDayCount((count) => Math.min(count + 14, 365));
      setIsLoadingMoreMeetingDays(false);
    }, 500);
  }, [isLoadingMoreMeetingDays, visibleMeetingDayCount]);

  const loadMoreDays = useCallback(() => {
    if (isLoadingMoreDays || visibleDayCount >= 365) return;
    setIsLoadingMoreDays(true);
    loadMoreTimer.current = setTimeout(() => {
      setVisibleDayCount((count) => Math.min(count + 14, 365));
      setIsLoadingMoreDays(false);
    }, 650);
  }, [isLoadingMoreDays, visibleDayCount]);

  const handleOpenDetail = (item: AgendaItemCustom) => {
    setSelectedAgendaItem(item);
    setDetailModalVisible(true);
  };

  const handleJoinMeeting = (url?: string) => {
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert("Error", "No se pudo abrir el enlace de la reunión.");
      });
    }
  };

  const renderItem = useCallback((item: AgendaItemCustom) => (
    <Pressable
      onPress={() => handleOpenDetail(item)}
      style={({ pressed }) => [
        styles.agendaCard,
        { backgroundColor: colors.card, borderColor: colors.inputBorder, opacity: pressed ? 0.85 : 1 }
      ]}
    >
      <View style={styles.accentIndicator} />
      <View style={styles.agendaCardBody}>
        <View style={styles.agendaTimeRow}>
          <Clock size={12} color={PRIMARY_BLUE} />
          <Text style={styles.agendaItemTime}>{item.time}</Text>
          <Text style={styles.agendaItemDurationDot}>•</Text>
          <Text style={[styles.agendaItemDuration, { color: colors.subtitle }]}>{item.duration}</Text>
        </View>
        <Text style={[styles.agendaItemTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.agendaItemDetail, { color: colors.subtitle }]} numberOfLines={2}>
          {item.detail}
        </Text>
      </View>
    </Pressable>
  ), [colors.card, colors.inputBorder, colors.text, colors.subtitle]);

  const renderDay = useCallback((day: SimpleDayAgenda | undefined) => {
    const dateStr = day?.date ?? day?.day;
    const isToday = dateStr === today;

    return (
      <View style={[styles.dayColumn, darkMode && { backgroundColor: "#17324b" }]}>
        <Text style={[styles.dayNumber, { color: isToday ? PRIMARY_BLUE : colors.text }]}>
          {dateStr ? getDateKeyParts(dateStr).day : ""}
        </Text>
        <Text style={[styles.dayName, { color: isToday ? PRIMARY_BLUE : colors.subtitle }]}>
          {formatDayHeader(dateStr).split(" ")[0]}
        </Text>
      </View>
    );
  }, [colors.text, colors.subtitle, darkMode, today]);

  const renderCustomList = useCallback((listProps: SimpleReservationListProps) => {
    const rawItems = (listProps.items ?? {}) as Record<string, AgendaItemCustom[]>;
    const startKey = agendaStartDate;
    const data: AgendaRow[] = [];
    for (let i = 0; i < visibleDayCount; i += 1) {
      const key = addDaysToDateKey(startKey, i);
      const entries = rawItems[key];
      if (!entries || entries.length === 0) {
        data.push({ key: `empty-${key}`, kind: "empty", date: key });
      } else {
        data.push({ key: `entries-${key}`, kind: "entry", date: key, entries });
      }
    }
    return (
      <View style={styles.customListContainer}>
        <FlatList
          key={agendaStartDate}
          ref={agendaListRef}
          data={data}
          keyExtractor={(it) => it.key}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          onEndReached={loadMoreDays}
          onEndReachedThreshold={0.25}
          onViewableItemsChanged={onVisibleAgendaRowsChanged}
          viewabilityConfig={agendaViewabilityConfig}
          onScrollToIndexFailed={({ index, averageItemLength }) => {
            agendaListRef.current?.scrollToOffset({ offset: averageItemLength * index, animated: true });
          }}
          ListFooterComponent={isLoadingMoreDays ? (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color={PRIMARY_BLUE} />
              <Text style={styles.loadingMoreText}>Cargando más días...</Text>
            </View>
          ) : null}
          renderItem={({ item }) => {
            if (item.kind === "empty") {
              return (
                <View style={styles.customRow}>
                  {renderDay({ date: item.date })}
                  <View style={[styles.emptyAppointmentCard, { borderColor: colors.inputBorder }]}>
                    <Text style={[styles.emptyAppointmentText, { color: colors.subtitle }]}>
                      {NO_APPOINTMENT_LABEL}
                    </Text>
                  </View>
                </View>
              );
            }
            return (
              <View style={styles.customRow}>
                {renderDay({ date: item.date })}
                <View style={styles.dayAppointmentsColumn}>
                  {item.entries?.map((entry) => (
                    <View key={entry.id}>{renderItem(entry)}</View>
                  ))}
                </View>
              </View>
            );
          }}
        />
      </View>
    );
  }, [agendaStartDate, visibleDayCount, isLoadingMoreDays, loadMoreDays, onVisibleAgendaRowsChanged, agendaViewabilityConfig, colors.inputBorder, colors.subtitle, renderDay, renderItem]);

  const openMeetingModal = async () => {
    if (releaseInFlightTokenRef.current) return;
    if (currentHoldRef.current) await releaseCurrentHold();

    flowConfirmedRef.current = false;
    setStep(1);
    setSelectedDoctorId(null);
    setMeetingDate("");
    setMeetingTime("");
    setMeetingEndTime("");
    setCurrentHold(null);
    currentHoldRef.current = null;
    setHoldSecondsRemaining(0);
    setMeetingTitle("");
    setMeetingDescription("");
    setDoctorSearch("");
    setVisibleMeetingDayCount(14);
    setMeetingModalVisible(true);
  };

  const handleSelectDoctor = async (doctorId: number) => {
    if (doctorId === selectedDoctorId || isCreatingHold || isReleasingHold || releaseInFlightTokenRef.current) return;
    await releaseCurrentHold();
    setMeetingDate("");
    setSelectedDoctorId(doctorId);
  };

  const handleSelectMeetingDate = async (date: string) => {
    if (isCreatingHold || isReleasingHold || releaseInFlightTokenRef.current) return;
    if (date === meetingDate && !currentHold) {
      setTimeModalVisible(true);
      return;
    }

    await releaseCurrentHold();
    setMeetingDate(date);
    setTimeModalVisible(true);
  };

  const handleWizardBack = async () => {
    if (isCreatingHold || isReleasingHold || isRegisteringMeeting || releaseInFlightTokenRef.current) return;
    if (currentHoldRef.current) await releaseCurrentHold();
    setStep((currentStep) => Math.max(1, currentStep - 1) as 1 | 2 | 3 | 4);
  };

  const handleCancelMeeting = async () => {
    if (isCreatingHold || isRegisteringMeeting || releaseInFlightTokenRef.current) return;
    await releaseCurrentHold();
    setMeetingModalVisible(false);
  };

  const handleSelectAvailabilitySlot = async (slot: DoctorAvailabilitySlotDTO) => {
    if (!selectedDoctorId || !meetingDate || isCreatingHold || isReleasingHold || holdRequestInFlight.current) return;

    if (currentHold?.scheduledAt === slot.scheduled_at) {
      setTimeModalVisible(false);
      return;
    }

    holdRequestInFlight.current = true;
    setHoldingScheduledAt(slot.scheduled_at);

    try {
      // A previous hold must be released before asking for the next one.
      await releaseCurrentHold();

      const response = await createMeetingHold({
        doctor_id: selectedDoctorId,
        scheduled_at: slot.scheduled_at,
      }).unwrap();

      const expiresAt = parsePeruDateTime(response.expires_at);
      if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
        throw { data: { message: "La reserva temporal recibida ya venció." } };
      }

      const nextHold: CurrentMeetingHold = {
        holdToken: response.hold_token,
        expiresAt: response.expires_at,
        doctorId: selectedDoctorId,
        scheduledAt: slot.scheduled_at,
      };
      currentHoldRef.current = nextHold;
      setCurrentHold(nextHold);
      setMeetingTime(formatAvailabilityTime(slot.start_time));
      setMeetingEndTime(formatAvailabilityTime(slot.end_time));
      setHoldSecondsRemaining(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)));
      setTimeModalVisible(false);
    } catch (error) {
      clearHoldState();
      setRegistrationTitle(getMeetingRequestErrorTitle(error, "Horario no disponible"));
      setRegistrationStatus("error");
      setRegistrationMessage(getMeetingRequestErrorMessage(error));
      setRegistrationModalVisible(true);
      const requestError = error as { status?: number | string };
      if (requestError?.status === 409) void refetchAvailability();
    } finally {
      holdRequestInFlight.current = false;
      setHoldingScheduledAt(null);
    }
  };

  const handleSubmitMeeting = async () => {
    if (
      !selectedDoctorId
      || !meetingDate
      || !currentHold
      || holdSecondsRemaining <= 0
      || currentHold.doctorId !== selectedDoctorId
      || !meetingTime
      || !meetingEndTime
      || !meetingTitle.trim()
      || !meetingDescription.trim()
    ) {
      Alert.alert("Datos incompletos", "Revisa el doctor, la fecha, el horario y los datos de la consulta.");
      return;
    }

    if (isRegisteringMeeting || registerRequestInFlight.current) return;

    registerRequestInFlight.current = true;
    setRegistrationTitle("Agendando reunión");
    setRegistrationStatus("loading");
    setRegistrationMessage("");
    setRegistrationModalVisible(true);

    try {
      const response = await registerMeeting({
        hold_token: currentHold.holdToken,
        doctor_id: currentHold.doctorId,
        scheduled_at: currentHold.scheduledAt,
        reason: meetingDescription.trim(),
        status: "pending",
        start_date: toPeruTimestamp(meetingDate, meetingTime),
        end_date: toPeruTimestamp(meetingDate, meetingEndTime),
        title: meetingTitle.trim(),
      }).unwrap();

      flowConfirmedRef.current = true;
      // The backend consumes the hold while registering. The DELETE is
      // idempotent, so calling it afterwards also guarantees cleanup when the
      // backend keeps the row temporarily.
      await releaseCurrentHold();
      setRegistrationTitle("Reunión agendada");
      setRegistrationStatus("success");
      setRegistrationMessage(response.message || "La reunión fue agendada correctamente.");
    } catch (error) {
      const requestError = error as { status?: number | string };
      if (requestError?.status === 409) {
        clearHoldState();
        setStep(2);
        void refetchAvailability();
      }
      setRegistrationTitle(getMeetingRequestErrorTitle(error, "Reserva vencida"));
      setRegistrationStatus("error");
      setRegistrationMessage(getMeetingRequestErrorMessage(error));
    } finally {
      registerRequestInFlight.current = false;
    }
  };

  const closeRegistrationModal = () => {
    if (registrationStatus === "loading") return;
    setRegistrationModalVisible(false);

    if (registrationStatus === "success") {
      setMeetingModalVisible(false);
      router.back();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.card }]}>
          <ArrowLeft size={20} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Asistencia médica</Text>
        <ThemeToggle />
      </View>

      <View style={styles.topActionBar}>
        <Pressable style={styles.submitButton} onPress={openMeetingModal}>
          <CalendarDays size={18} color="#ffffff" />
          <Text style={styles.submitButtonText}>Agendar reunión</Text>
        </Pressable>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.agendaContainer}>
          <View style={[styles.calendarShell, { borderColor: colors.inputBorder, backgroundColor: colors.card }]}> 
            {calendarExpanded ? (
              <>
                <MonthCalendar
                  key={selectedDate}
                  current={selectedDate}
                  minDate={today}
                  firstDay={0}
                  markedDates={{ [selectedDate]: { selected: true, selectedColor: PRIMARY_BLUE, selectedTextColor: "#ffffff" } }}
                  onDayPress={(day) => {
                    selectAgendaDate(day.dateString);
                    setCalendarExpanded(false);
                  }}
                  theme={{
                    calendarBackground: colors.card,
                    monthTextColor: colors.text,
                    dayTextColor: colors.text,
                    textSectionTitleColor: colors.subtitle,
                    textDisabledColor: darkMode ? "#64748b" : colors.inputBorder,
                    arrowColor: PRIMARY_BLUE,
                    todayTextColor: PRIMARY_BLUE,
                  }}
                />
                <Pressable style={styles.collapseCalendarButton} onPress={() => setCalendarExpanded(false)}>
                  <ChevronUp size={16} color={PRIMARY_BLUE} />
                  <Text style={styles.collapseCalendarText}>Ocultar calendario</Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.weekNavigation}>
                  <Pressable
                    disabled={selectedDate <= today}
                    onPress={() => selectAgendaDate(addDaysToDateKey(selectedDate, -7) < today ? today : addDaysToDateKey(selectedDate, -7))}
                    style={({ pressed }) => [styles.weekArrowButton, darkMode && { backgroundColor: "#17324b" }, pressed && styles.weekArrowPressed, selectedDate <= today && styles.weekArrowDisabled]}
                  >
                    <ChevronLeft size={18} color={selectedDate <= today ? (darkMode ? "#64748b" : colors.inputBorder) : PRIMARY_BLUE} />
                  </Pressable>
                  <Pressable style={styles.monthToggle} onPress={() => setCalendarExpanded(true)}>
                    <Text style={[styles.weekMonthTitle, { color: colors.text }]}>{selectedMonthLabel}</Text>
                    <ChevronDown size={16} color={PRIMARY_BLUE} />
                  </Pressable>
                  <Pressable
                    onPress={() => selectAgendaDate(addDaysToDateKey(selectedDate, 7))}
                    style={({ pressed }) => [styles.weekArrowButton, darkMode && { backgroundColor: "#17324b" }, pressed && styles.weekArrowPressed]}
                  >
                    <ChevronRight size={18} color={PRIMARY_BLUE} />
                  </Pressable>
                </View>
                <View style={styles.weekGrid}>
                  {visibleWeek.map((dateKey, index) => {
                    const isActive = dateKey === selectedDate;
                    const isDisabled = dateKey < today;
                    return (
                      <Pressable key={dateKey} disabled={isDisabled} onPress={() => selectAgendaDate(dateKey)} style={styles.weekDayCell}>
                        <Text style={[styles.weekDayLabel, { color: isDisabled ? (darkMode ? "#64748b" : colors.inputBorder) : colors.subtitle }]}>{ES_WEEKDAY_SHORT[index]}</Text>
                        <View style={[styles.weekDateCircle, isActive && styles.weekDateCircleActive]}>
                          <Text style={[styles.weekDateText, { color: isDisabled ? (darkMode ? "#64748b" : colors.inputBorder) : colors.text }, isActive && styles.weekDateTextActive]}>
                            {getDateKeyParts(dateKey).day}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
          </View>
          {isLoadingAdvisories ? (
            <View style={styles.listStateContainer}>
              <ActivityIndicator size="small" color={PRIMARY_BLUE} />
              <Text style={[styles.listStateText, { color: colors.subtitle }]}>Cargando asesorías...</Text>
            </View>
          ) : isAdvisoriesError ? (
            <View style={styles.listStateContainer}>
              <Text style={[styles.listStateText, { color: colors.subtitle }]}>No se pudieron cargar las asesorías.</Text>
              <Pressable onPress={refetchAdvisories} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </Pressable>
            </View>
          ) : renderCustomList({ items: agendaItems })}
        </View>
      </View>

      {/* MODAL REDISEÑADO - BALANCE DE UI/UX PERFECTO */}
      <Modal visible={detailModalVisible} onClose={() => setDetailModalVisible(false)} title="" showFooter={false}>
        {selectedAgendaItem && (
            <ScrollView
              style={styles.detailModalScroll}
              contentContainerStyle={styles.detailModalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalContentContainer}>
              {/* Header Hero */}
              <View style={styles.heroHeader}>
                <View style={styles.heroIconBadge}>
                  <Video size={24} color={PRIMARY_BLUE} />
                </View>
                <Text style={[styles.heroTitleText, { color: colors.text }]}>
                  {selectedAgendaItem.title}
                </Text>
              </View>

              {/* Grid 2x2 de Fecha / Hora / Duración */}
              <View style={styles.timeGridContainer}>
                <View style={styles.timeGridCard}>
                  <Calendar size={16} color={PRIMARY_BLUE} />
                  <View>
                    <Text style={styles.timeGridLabel}>Fecha</Text>
                    <Text style={styles.timeGridValue}>{formatFullDate(selectedAgendaItem.date)}</Text>
                  </View>
                </View>

                <View style={styles.timeGridCard}>
                  <Clock size={16} color={PRIMARY_BLUE} />
                  <View>
                    <Text style={styles.timeGridLabel}>Hora / Duración</Text>
                    <Text style={styles.timeGridValue}>
                      {selectedAgendaItem.time} ({selectedAgendaItem.duration || "1h aprox."})
                    </Text>
                  </View>
                </View>
              </View>

              {/* Ficha Médica Elegante */}
              <View style={[styles.doctorCardBox, { borderColor: colors.inputBorder }]}>
                <View style={styles.doctorAvatarCircle}>
                  <User size={20} color={PRIMARY_BLUE} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.doctorCardSub}>Médico asignado</Text>
                  <Text style={[styles.doctorCardName, { color: colors.text }]}>
                    {selectedAgendaItem.doctorName || "Médico por confirmar"}
                  </Text>
                  <Text style={styles.doctorCardSpecialty}>
                    {selectedAgendaItem.doctorSpecialty || "Medicina General"}
                  </Text>
                </View>
              </View>

              {/* Caja de Motivo / Síntomas */}
              <View style={styles.symptomsBox}>
                <View style={styles.symptomsHeader}>
                  <FileText size={14} color={PRIMARY_BLUE_DARK} />
                  <Text style={styles.symptomsTitle}>Motivo de consulta</Text>
                </View>
                <Text style={styles.symptomsDetailText}>{selectedAgendaItem.detail}</Text>
              </View>

              {/* Botón CTA Único */}
              <View style={styles.buttonActionBox}>
                {selectedAgendaItem.meetingUrl ? (
                  <Pressable
                    style={({ pressed }) => [styles.primaryCtaButton, pressed && { opacity: 0.9 }]}
                    onPress={() => handleJoinMeeting(selectedAgendaItem.meetingUrl)}
                  >
                    <Video size={18} color="#ffffff" />
                    <Text style={styles.primaryCtaText}>Unirse a la reunión</Text>
                  </Pressable>
                ) : (
                  <View style={[styles.primaryCtaButton, { backgroundColor: "#cbd5e1" }]}>
                    <Text style={styles.primaryCtaText}>Enlace no disponible</Text>
                  </View>
                )}

                <Pressable
                  style={({ pressed }) => [styles.detailCloseButton, pressed && styles.detailCloseButtonPressed]}
                  onPress={() => setDetailModalVisible(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar detalle de la cita"
                >
                  <Text style={[styles.detailCloseButtonText, { color: colors.text }]}>Cerrar</Text>
                </Pressable>
              </View>
              </View>
            </ScrollView>
        )}
      </Modal>

      {/* Modal 2: Wizard para Agendar Nueva Reunión */}
      <Modal visible={meetingModalVisible} onClose={handleCancelMeeting} title="Agendar reunión" showFooter={false}>
        <View>
          <View style={styles.wizardHeader}>
            {step > 1 && (
              <Pressable disabled={isCreatingHold || isReleasingHold || isRegisteringMeeting} onPress={handleWizardBack} style={styles.wizardBackButton}>
                <ChevronLeft size={20} color={colors.text} />
              </Pressable>
            )}
            <View style={styles.wizardProgressContent}>
              <Text style={styles.wizardProgressLabel}>PASO {step} DE 4</Text>
              <View style={styles.stepsIndicator}>
                {[1, 2, 3, 4].map((i) => (
                  <View key={i} style={[styles.stepDot, step >= i && styles.stepDotActive]} />
                ))}
              </View>
            </View>
          </View>

          <ScrollView
            style={[
              styles.meetingFormScroll,
              step === 1 && styles.meetingFormScrollDoctor,
              step === 2 && styles.meetingFormScrollSchedule,
              step === 3 && styles.meetingFormScrollDetails,
              step === 4 && styles.meetingFormScrollReview,
            ]}
            showsVerticalScrollIndicator={false}
            scrollEnabled={step !== 2}
            bounces={step !== 2}
            disableScrollViewPanResponder={step === 2}
          >
            {step === 1 && (
              <View style={styles.stepContainer}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>1. Selecciona un doctor</Text>
                <Text style={[styles.stepSubtitle, { color: colors.subtitle }]}>¿Con quién deseas agendar la cita médica?</Text>

                <View style={[styles.doctorSearchBox, { borderColor: colors.inputBorder, backgroundColor: colors.card }]}>
                  <Search size={18} color={colors.subtitle} />
                  <TextInput
                    value={doctorSearch}
                    onChangeText={setDoctorSearch}
                    placeholder="Busca un doctor"
                    placeholderTextColor={colors.subtitle}
                    style={[styles.doctorSearchInput, { color: colors.text }]}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                    accessibilityLabel="Buscar doctor por nombre o especialidad"
                  />
                </View>
                
                <ScrollView
                  style={styles.doctorListScroll}
                  contentContainerStyle={styles.doctorListContainer}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={filteredMeetingDoctors.length > 3}
                >
                  {isLoadingDoctors ? (
                    <View style={styles.doctorListState}>
                      <ActivityIndicator size="small" color={PRIMARY_BLUE} />
                      <Text style={[styles.doctorListStateText, { color: colors.subtitle }]}>Cargando doctores...</Text>
                    </View>
                  ) : isDoctorsError ? (
                    <View style={styles.doctorListState}>
                      <Text style={[styles.doctorListStateText, { color: colors.subtitle }]}>No se pudo cargar la lista de doctores.</Text>
                      <Pressable style={styles.retryButton} onPress={refetchDoctors}>
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                      </Pressable>
                    </View>
                  ) : meetingDoctors.length === 0 ? (
                    <View style={styles.doctorListState}>
                      <Text style={[styles.doctorListStateText, { color: colors.subtitle }]}>No hay doctores disponibles.</Text>
                    </View>
                  ) : filteredMeetingDoctors.length === 0 ? (
                    <View style={styles.doctorListState}>
                      <Text style={[styles.doctorListStateText, { color: colors.subtitle }]}>No se encontraron doctores.</Text>
                    </View>
                  ) : filteredMeetingDoctors.map((doc) => {
                    const isSelected = selectedDoctorId === doc.id;
                    return (
                      <Pressable
                        key={doc.id}
                        disabled={isCreatingHold || isReleasingHold}
                        onPress={() => handleSelectDoctor(doc.id)}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: isSelected }}
                        style={[
                          styles.doctorSelectCard,
                          { borderColor: isSelected ? PRIMARY_BLUE : colors.inputBorder, backgroundColor: isSelected ? (darkMode ? "#102b45" : PRIMARY_BLUE_LIGHT) : colors.card },
                          isSelected && styles.doctorSelectCardSelected,
                        ]}
                      >
                        <View style={[styles.doctorAvatar, isSelected && styles.doctorAvatarSelected]}>
                          <User size={20} color={isSelected ? "#ffffff" : colors.subtitle} />
                        </View>
                        <View style={styles.doctorSelectContent}>
                          {isSelected && (
                            <Text style={styles.doctorSelectedLabel}>SELECCIONADO</Text>
                          )}
                          <Text style={[styles.doctorName, { color: colors.text }]}>{doc.name}</Text>
                          <View style={[styles.doctorSpecialtyBadge, isSelected && styles.doctorSpecialtyBadgeSelected]}>
                            <Text style={[styles.doctorSpecialty, { color: isSelected ? PRIMARY_BLUE_DARK : colors.subtitle }]}>{doc.specialty}</Text>
                          </View>
                        </View>
                        <View style={[styles.doctorSelectionIndicator, isSelected && styles.doctorSelectionIndicatorSelected]}>
                          {isSelected && <Check size={16} color="#ffffff" strokeWidth={3} />}
                        </View>
                      </Pressable>
                    );
                  })}
                </ScrollView>

              </View>
            )}

            {step === 2 && (
              <View style={styles.stepContainer}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>2. Fecha y hora de atención</Text>
                <View style={[styles.appointmentDoctorInfo, darkMode && { backgroundColor: "#102b45" }]}>
                  <View style={[styles.appointmentDoctorIcon, { backgroundColor: colors.card }]}>
                    <User size={15} color={PRIMARY_BLUE} />
                  </View>
                  <View style={styles.appointmentDoctorText}>
                    <Text style={[styles.appointmentDoctorName, { color: colors.text }]} numberOfLines={2}>{selectedDoctor?.name}</Text>
                    <Text style={[styles.appointmentDoctorSpecialty, { color: colors.subtitle }]} numberOfLines={1}>{selectedDoctor?.specialty}</Text>
                  </View>
                </View>

                <Text style={[styles.sectionLabel, { color: colors.text }]}>Selecciona un día</Text>
                <FlatList
                  horizontal
                  data={meetingDays}
                  keyExtractor={(day) => day.date}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.dateStripContainer}
                  onEndReached={loadMoreMeetingDays}
                  onEndReachedThreshold={0.35}
                  ListFooterComponent={isLoadingMoreMeetingDays ? (
                    <View style={styles.dateLoadingMore}>
                      <ActivityIndicator size="small" color={PRIMARY_BLUE} />
                      <Text style={styles.dateLoadingMoreText}>Cargando más días...</Text>
                    </View>
                  ) : null}
                  renderItem={({ item: day }) => {
                    const isSelected = day.date === meetingDate;
                    const isDisabled = day.isPast;

                    return (
                      <Pressable
                        key={day.date}
                        disabled={isDisabled || isCreatingHold || isReleasingHold}
                        onPress={() => handleSelectMeetingDate(day.date)}
                        style={[
                          styles.dateCard,
                          { borderColor: isSelected ? PRIMARY_BLUE : colors.inputBorder, backgroundColor: isSelected ? PRIMARY_BLUE : colors.card },
                          isSelected && styles.dateCardSelected,
                          isDisabled && styles.dateCardDisabled,
                        ]}
                      >
                        <Text style={[
                          styles.dateDayName, 
                          { color: isSelected ? "#ffffff" : colors.subtitle },
                          isDisabled && styles.textDisabled
                        ]}>
                          {day.label}
                        </Text>
                        <Text style={[
                          styles.dateDayNumber, 
                          { color: isSelected ? "#ffffff" : colors.text },
                          isDisabled && styles.textDisabled
                        ]}>
                          {day.dayNumber}
                        </Text>
                        <View style={[
                          styles.statusDot, 
                          { backgroundColor: isDisabled ? "#cbd5e1" : isSelected ? "#ffffff" : "#22c55e" }
                        ]} />
                      </Pressable>
                    );
                  }}
                />

                <Pressable
                  disabled={!meetingDate}
                  onPress={() => setTimeModalVisible(true)}
                  style={[styles.timePickerCard, !meetingDate && styles.timePickerCardDisabled, darkMode && { backgroundColor: "#102b45", borderColor: colors.inputBorder }]}
                >
                  <View style={[styles.timePickerIcon, { backgroundColor: colors.card }]}>
                    <Clock size={18} color={PRIMARY_BLUE} />
                  </View>
                  <View style={styles.timePickerContent}>
                    <Text style={styles.timePickerLabel}>{currentHold ? "HORARIO RESERVADO" : "HORARIO"}</Text>
                    <Text style={[styles.timePickerValue, { color: meetingDate ? colors.text : colors.subtitle }]}>
                      {!meetingDate
                        ? "Selecciona primero una fecha"
                        : currentHold
                          ? `${meetingTime} - ${meetingEndTime}`
                          : "Toca para elegir un horario"}
                    </Text>
                  </View>
                  {meetingDate && <ChevronRight size={18} color={PRIMARY_BLUE} />}
                </Pressable>

              </View>
            )}

            {step === 3 && (
              <View style={[styles.stepContainer, step === 3 && styles.stepContainerWithActionGap]}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>3. Datos de la consulta</Text>
                <Text style={[styles.stepSubtitle, { color: colors.subtitle }]}>Ingresa el título y el motivo de la consulta.</Text>

                {currentHold && (
                  <View style={styles.holdCountdownBanner}>
                    <Clock size={15} color={PRIMARY_BLUE_DARK} />
                    <Text style={styles.holdCountdownLabel}>Reserva disponible por</Text>
                    <Text style={styles.holdCountdownValue}>{formatCountdown(holdSecondsRemaining)}</Text>
                  </View>
                )}
                
                <Text style={[styles.formLabel, { color: colors.text }]}>Título</Text>
                <TextInput
                  value={meetingTitle}
                  onChangeText={setMeetingTitle}
                  placeholder="Ej. Consulta de seguimiento"
                  placeholderTextColor={colors.subtitle}
                  style={[styles.formInput, { color: colors.text, borderColor: colors.inputBorder }]}
                />

                <Text style={[styles.formLabel, { color: colors.text }]}>Motivo</Text>
                <TextInput
                  value={meetingDescription}
                  onChangeText={setMeetingDescription}
                  placeholder="Describe brevemente el motivo de la consulta"
                  placeholderTextColor={colors.subtitle}
                  multiline
                  numberOfLines={3}
                  style={[styles.formInput, styles.formTextArea, { color: colors.text, borderColor: colors.inputBorder }]}
                />

              </View>
            )}

            {step === 4 && (
              <View style={styles.stepContainer}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>4. Detalle de la reunión</Text>
                <Text style={[styles.stepSubtitle, { color: colors.subtitle }]}>Revisa los datos antes de confirmar.</Text>

                {currentHold && (
                  <View style={styles.holdCountdownBanner}>
                    <Clock size={15} color={PRIMARY_BLUE_DARK} />
                    <Text style={styles.holdCountdownLabel}>Reserva disponible por</Text>
                    <Text style={styles.holdCountdownValue}>{formatCountdown(holdSecondsRemaining)}</Text>
                  </View>
                )}

                <View style={styles.reviewContainer}>
                  <View style={styles.reviewTitleCard}>
                    <View style={styles.reviewTitleIcon}>
                      <Video size={19} color="#ffffff" />
                    </View>
                    <View style={styles.reviewTitleContent}>
                      <Text style={styles.reviewTitleEyebrow}>CONSULTA</Text>
                      <Text style={styles.reviewMeetingTitle}>{meetingTitle}</Text>
                    </View>
                  </View>

                  <View style={[styles.reviewDoctorCard, { borderColor: colors.inputBorder }]}>
                    <View style={styles.reviewDoctorAvatar}>
                      <User size={20} color="#ffffff" />
                    </View>
                    <View style={styles.reviewDoctorContent}>
                      <Text style={styles.reviewEyebrow}>DOCTOR</Text>
                      <Text style={[styles.reviewDoctorName, { color: colors.text }]}>{selectedDoctor?.name}</Text>
                      <Text style={[styles.reviewDoctorSpecialty, { color: colors.subtitle }]}>{selectedDoctor?.specialty}</Text>
                    </View>
                  </View>

                  <View style={styles.reviewScheduleRow}>
                    <View style={styles.reviewScheduleCard}>
                      <Calendar size={17} color={PRIMARY_BLUE} />
                      <Text style={styles.reviewScheduleLabel}>FECHA</Text>
                      <Text style={styles.reviewScheduleValue}>{formatFullDate(meetingDate)}</Text>
                    </View>
                    <View style={styles.reviewScheduleCard}>
                      <Clock size={17} color={PRIMARY_BLUE} />
                      <Text style={styles.reviewScheduleLabel}>HORARIO</Text>
                      <Text style={styles.reviewScheduleValue}>
                        {currentHold
                          ? `${meetingTime} - ${meetingEndTime}`
                          : meetingTime}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.reviewReasonCard}>
                    <View style={styles.reviewReasonHeader}>
                      <FileText size={15} color={PRIMARY_BLUE_DARK} />
                      <Text style={styles.reviewReasonLabel}>Motivo de la consulta</Text>
                    </View>
                    <Text style={styles.reviewReasonText} numberOfLines={3}>{meetingDescription}</Text>
                  </View>
                </View>

              </View>
            )}
          </ScrollView>

          {step === 1 && (
            <Pressable
              disabled={!selectedDoctorId}
              style={[
                styles.nextButton,
                styles.wizardFixedAction,
                !selectedDoctorId && styles.buttonDisabled,
              ]}
              onPress={() => setStep(2)}
            >
              <Text style={styles.confirmButtonText}>Continuar</Text>
              <ChevronRight size={18} color="#ffffff" />
            </Pressable>
          )}

          {step === 2 && (
            <Pressable
              disabled={!meetingDate || !currentHold || holdSecondsRemaining <= 0 || isCreatingHold || isReleasingHold}
              style={[
                styles.nextButton,
                styles.wizardFixedAction,
                (!meetingDate || !currentHold || holdSecondsRemaining <= 0 || isCreatingHold || isReleasingHold) && styles.buttonDisabled,
              ]}
              onPress={() => setStep(3)}
            >
              <Text style={styles.confirmButtonText}>Continuar</Text>
              <ChevronRight size={18} color="#ffffff" />
            </Pressable>
          )}

          {step === 3 && (
            <Pressable
              disabled={!meetingTitle.trim() || !meetingDescription.trim() || !currentHold || holdSecondsRemaining <= 0 || isReleasingHold}
              style={[
                styles.nextButton,
                styles.wizardFixedAction,
                (!meetingTitle.trim() || !meetingDescription.trim() || !currentHold || holdSecondsRemaining <= 0 || isReleasingHold) && styles.buttonDisabled,
              ]}
              onPress={() => setStep(4)}
            >
              <Text style={styles.confirmButtonText}>Continuar</Text>
              <ChevronRight size={18} color="#ffffff" />
            </Pressable>
          )}

          {step === 4 && (
            <Pressable
              disabled={isRegisteringMeeting || isReleasingHold || !currentHold || holdSecondsRemaining <= 0}
              style={[
                styles.confirmButton,
                styles.wizardFixedAction,
                (isRegisteringMeeting || isReleasingHold || !currentHold || holdSecondsRemaining <= 0) && styles.buttonDisabled,
              ]}
              onPress={handleSubmitMeeting}
            >
              {isRegisteringMeeting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Check size={18} color="#ffffff" strokeWidth={2.5} />
              )}
              <Text style={styles.confirmButtonText}>
                {isRegisteringMeeting ? "Agendando..." : "Confirmar y agendar"}
              </Text>
            </Pressable>
          )}

          <Pressable
            style={[styles.cancelTextBtn, { marginTop: 10 }]}
            disabled={isCreatingHold || isReleasingHold || isRegisteringMeeting}
            onPress={handleCancelMeeting}
          >
            <Text style={[styles.cancelTextBtnText, { color: colors.text }]}>
              {isReleasingHold ? "Liberando horario..." : "Cancelar"}
            </Text>
          </Pressable>
        </View>
      </Modal>

      <Modal
        visible={timeModalVisible}
        onClose={() => setTimeModalVisible(false)}
        title="Elige un horario"
        showFooter={false}
      >
        <View style={styles.timeModalContent}>
          <View style={[styles.timeModalDateBadge, darkMode && { backgroundColor: "#102b45" }]}>
            <Calendar size={16} color={PRIMARY_BLUE} />
            <Text style={[styles.timeModalDateText, darkMode && { color: colors.text }]}>{formatFullDate(meetingDate)}</Text>
          </View>

          {isAvailabilityLoading ? (
            <View style={styles.availabilityState}>
              <ActivityIndicator size="small" color={PRIMARY_BLUE} />
              <Text style={[styles.doctorListStateText, { color: colors.subtitle }]}>Cargando horarios...</Text>
            </View>
          ) : isAvailabilityError ? (
            <View style={styles.availabilityState}>
              <Text style={[styles.doctorListStateText, { color: colors.subtitle }]}>
                {getMeetingRequestErrorMessage(availabilityError)}
              </Text>
              <Pressable style={styles.retryButton} onPress={refetchAvailability}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </Pressable>
            </View>
          ) : availableSlots.length === 0 ? (
            <View style={styles.availabilityState}>
              <Text style={[styles.doctorListStateText, { color: colors.subtitle }]}>No hay horarios disponibles para esta fecha.</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.timeModalList}
              contentContainerStyle={styles.timeGrid}
              nestedScrollEnabled
              showsVerticalScrollIndicator={availableSlots.length > 6}
            >
              {availableSlots.map((slot, index) => {
                const startTime = formatAvailabilityTime(slot.start_time);
                const endTime = formatAvailabilityTime(slot.end_time);
                const isSelected = currentHold?.scheduledAt === slot.scheduled_at;
                return (
                  <Pressable
                    key={slot.scheduled_at || `${slot.start_time}-${slot.end_time}-${index}`}
                    disabled={isCreatingHold || isReleasingHold}
                    onPress={() => handleSelectAvailabilitySlot(slot)}
                    style={[
                      styles.timeSlot,
                      isSelected && styles.timeSlotSelected,
                      (isCreatingHold || isReleasingHold) && styles.timeSlotDisabled,
                      darkMode && !isSelected && { backgroundColor: "#102b45", borderColor: colors.inputBorder },
                    ]}
                  >
                    {isCreatingHold && holdingScheduledAt === slot.scheduled_at ? (
                      <ActivityIndicator size="small" color={PRIMARY_BLUE_DARK} />
                    ) : (
                      <Clock size={14} color={isSelected ? "#ffffff" : PRIMARY_BLUE_DARK} />
                    )}
                    <Text style={[styles.timeSlotText, { color: isSelected ? "#ffffff" : darkMode ? colors.text : PRIMARY_BLUE_DARK }]}>
                      {startTime} - {endTime}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          <Pressable style={styles.cancelTextBtn} onPress={() => setTimeModalVisible(false)}>
            <Text style={[styles.cancelTextBtnText, { color: colors.text }]}>Cerrar</Text>
          </Pressable>
        </View>
      </Modal>

      <Modal
        visible={registrationModalVisible}
        onClose={closeRegistrationModal}
        title={registrationTitle}
        showFooter={registrationStatus !== "loading"}
        footerText="Aceptar"
      >
        <View style={styles.registrationState}>
          {registrationStatus === "loading" ? (
            <>
              <ActivityIndicator size="large" color={PRIMARY_BLUE} />
              <Text style={[styles.registrationMessage, { color: colors.subtitle }]}>Cargando...</Text>
            </>
          ) : (
            <>
              <View style={[
                styles.registrationIcon,
                registrationStatus === "error" && styles.registrationIconError,
              ]}>
                {registrationStatus === "success" ? (
                  <Check size={26} color="#ffffff" strokeWidth={3} />
                ) : (
                  <Text style={styles.registrationErrorMark}>!</Text>
                )}
              </View>
              <Text style={[styles.registrationMessage, { color: colors.text }]}>{registrationMessage}</Text>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12 },
  backButton: { padding: 8, borderRadius: 12 },
  headerPlaceholder: { width: 36 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  topActionBar: { paddingHorizontal: 20, paddingBottom: 14 },
  card: { flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 10 },
  agendaContainer: { flex: 1, borderRadius: 18, overflow: "hidden" },
  calendarShell: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 10, paddingTop: 8, paddingBottom: 12, marginBottom: 10 },
  weekNavigation: { height: 42, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 4 },
  weekArrowButton: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: PRIMARY_BLUE_LIGHT },
  weekArrowPressed: { opacity: 0.65 },
  weekArrowDisabled: { opacity: 0.45 },
  monthToggle: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 8 },
  weekMonthTitle: { fontSize: 16, fontWeight: "800", textTransform: "capitalize" },
  weekGrid: { flexDirection: "row", marginTop: 4 },
  weekDayCell: { flex: 1, alignItems: "center" },
  weekDayLabel: { fontSize: 11, lineHeight: 15, fontWeight: "700", marginBottom: 7 },
  weekDateCircle: { width: 38, height: 38, borderRadius: 999, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  weekDateCircleActive: { backgroundColor: PRIMARY_BLUE, borderRadius: 999, overflow: "hidden" },
  weekDateText: { fontSize: 15, lineHeight: 19, fontWeight: "700", textAlign: "center" },
  weekDateTextActive: { color: "#ffffff" },
  collapseCalendarButton: { height: 34, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  collapseCalendarText: { color: PRIMARY_BLUE, fontSize: 12, fontWeight: "700" },
  customListContainer: { flex: 1 },
  listStateContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  listStateText: { fontSize: 13, fontWeight: "600" },
  retryButton: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10, backgroundColor: PRIMARY_BLUE },
  retryButtonText: { color: "#ffffff", fontSize: 13, fontWeight: "700" },
  loadingMoreContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 18 },
  loadingMoreText: { color: PRIMARY_BLUE, fontSize: 12, fontWeight: "600" },
  customRow: { flexDirection: "row", alignItems: "stretch", gap: 10, paddingVertical: 5, marginHorizontal: 2 },
  dayAppointmentsColumn: { flex: 1, gap: 8 },
  dayColumn: { width: 54, minHeight: 62, borderRadius: 14, backgroundColor: PRIMARY_BLUE_LIGHT, alignItems: "center", justifyContent: "center" },
  dayNumber: { fontSize: 20, lineHeight: 23, fontWeight: "800" },
  dayName: { marginTop: 2, fontSize: 10, lineHeight: 13, fontWeight: "800", letterSpacing: 0.4, textTransform: "uppercase" },
  
  // Agenda Item
  agendaCard: {
    flex: 1,
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 82,
    overflow: "hidden",
  },
  accentIndicator: {
    width: 4,
    backgroundColor: PRIMARY_BLUE,
  },
  agendaCardBody: {
    flex: 1,
    padding: 12,
  },
  agendaTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  agendaItemTime: { fontSize: 12, fontWeight: "700", color: PRIMARY_BLUE },
  agendaItemDurationDot: { fontSize: 10, color: "#94a3b8", marginHorizontal: 2 },
  agendaItemDuration: { fontSize: 11, fontWeight: "500" },
  agendaItemTitle: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  agendaItemDetail: { fontSize: 12, lineHeight: 16 },
  
  emptyAppointmentCard: {
    flex: 1,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 12,
    minHeight: 62,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  emptyAppointmentText: { fontSize: 12, fontWeight: "500" },

  submitButton: { backgroundColor: PRIMARY_BLUE, borderRadius: 14, minHeight: 48, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  submitButtonText: { color: "white", fontSize: 15, fontWeight: "700" },
  
  // Estilos del Modal Re-Diseñado UI/UX Balanceado
  detailModalScroll: { maxHeight: 520 },
  detailModalScrollContent: { paddingBottom: 2 },
  modalContentContainer: { paddingHorizontal: 2 },
  heroHeader: { alignItems: "center", marginBottom: 14 },
  heroIconBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: PRIMARY_BLUE_LIGHT, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  heroTitleText: { fontSize: 17, fontWeight: "800", textAlign: "center" },

  // Grid de Tiempos
  timeGridContainer: { gap: 8, marginBottom: 12 },
  timeGridCard: { minHeight: 52, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: PRIMARY_BLUE_LIGHT, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: PRIMARY_BLUE_BORDER },
  timeGridLabel: { fontSize: 10, fontWeight: "600", color: PRIMARY_BLUE_DARK, textTransform: "uppercase" },
  timeGridValue: { fontSize: 13, fontWeight: "700", color: PRIMARY_BLUE_DARK, marginTop: 2 },

  // Card de Médico
  doctorCardBox: { flexDirection: "row", alignItems: "center", padding: 12, borderWidth: 1, borderRadius: 12, gap: 10, marginBottom: 12 },
  doctorAvatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: PRIMARY_BLUE_LIGHT, alignItems: "center", justifyContent: "center" },
  doctorCardSub: { fontSize: 10, fontWeight: "600", color: "#94a3b8", textTransform: "uppercase" },
  doctorCardName: { fontSize: 14, fontWeight: "700" },
  doctorCardSpecialty: { fontSize: 12, color: "#64748b" },
  verifiedCheckBadge: { width: 18, height: 18, borderRadius: 9, backgroundColor: "#22c55e", alignItems: "center", justifyContent: "center" },

  // Caja de Síntomas
  symptomsBox: { backgroundColor: "#f8fafc", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 14 },
  symptomsHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  symptomsTitle: { fontSize: 12, fontWeight: "700", color: "#334155" },
  symptomsDetailText: { fontSize: 13, color: "#64748b", lineHeight: 18 },

  // Botón CTA
  buttonActionBox: { gap: 10 },
  primaryCtaButton: { backgroundColor: PRIMARY_BLUE, borderRadius: 12, height: 46, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  primaryCtaText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  cancelTextBtn: { height: 38, alignItems: "center", justifyContent: "center" },
  cancelTextBtnText: { fontSize: 13, fontWeight: "600" },
  detailCloseButton: { height: 44, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, backgroundColor: "#f8fafc" },
  detailCloseButtonPressed: { opacity: 0.7 },
  detailCloseButtonText: { fontSize: 14, fontWeight: "700" },

  // Wizard Styles
  wizardHeader: { minHeight: 42, flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 8, position: "relative" },
  wizardBackButton: { position: "absolute", left: 0, width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#f1f5f9" },
  wizardProgressContent: { alignItems: "center", gap: 4 },
  wizardProgressLabel: { color: PRIMARY_BLUE, fontSize: 9, lineHeight: 12, fontWeight: "800", letterSpacing: 1 },
  stepsIndicator: { flexDirection: "row", gap: 5 },
  stepDot: { width: 28, height: 5, borderRadius: 3, backgroundColor: "#e2e8f0" },
  stepDotActive: { backgroundColor: PRIMARY_BLUE },
  stepContainer: { paddingVertical: 4 },
  stepTitle: { fontSize: 17, lineHeight: 22, fontWeight: "800", marginBottom: 2 },
  stepSubtitle: { fontSize: 12, lineHeight: 17, marginBottom: 16 },
  meetingFormScroll: { paddingHorizontal: 4 },
  meetingFormScrollDoctor: { height: 310 },
  meetingFormScrollSchedule: { height: 265 },
  meetingFormScrollDetails: { height: 265 },
  meetingFormScrollReview: { height: 280 },
  wizardFixedAction: { marginHorizontal: 4, marginTop: 14 },
  stepContainerWithActionGap: { paddingBottom: 10 },
  appointmentDoctorInfo: { minHeight: 42, flexDirection: "row", alignItems: "center", gap: 8, marginTop: 5, marginBottom: 11, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 11, backgroundColor: PRIMARY_BLUE_LIGHT, borderLeftWidth: 3, borderLeftColor: PRIMARY_BLUE },
  appointmentDoctorIcon: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff" },
  appointmentDoctorText: { flex: 1 },
  appointmentDoctorName: { fontSize: 12, lineHeight: 15, fontWeight: "700" },
  appointmentDoctorSpecialty: { marginTop: 1, fontSize: 10, lineHeight: 13, fontWeight: "500" },
  
  doctorSearchBox: { minHeight: 46, flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, marginBottom: 12 },
  doctorSearchInput: { flex: 1, minHeight: 44, paddingVertical: 0, fontSize: 14 },
  doctorListScroll: { maxHeight: 286, marginBottom: 20 },
  doctorListContainer: { gap: 10 },
  doctorListState: { minHeight: 120, alignItems: "center", justifyContent: "center", gap: 10 },
  doctorListStateText: { fontSize: 13, fontWeight: "600", textAlign: "center" },
  doctorSelectCard: { flexDirection: "row", alignItems: "center", minHeight: 82, padding: 12, borderWidth: 1, borderRadius: 14, gap: 12 },
  doctorSelectCardSelected: { borderWidth: 1.5, shadowColor: PRIMARY_BLUE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.16, shadowRadius: 8, elevation: 3 },
  doctorAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: PRIMARY_BLUE_LIGHT, alignItems: "center", justifyContent: "center" },
  doctorAvatarSelected: { width: 46, height: 46, borderRadius: 23, backgroundColor: PRIMARY_BLUE },
  doctorSelectContent: { flex: 1, alignItems: "flex-start" },
  doctorSelectedLabel: { color: PRIMARY_BLUE, fontSize: 9, lineHeight: 12, fontWeight: "800", letterSpacing: 0.7, marginBottom: 2 },
  doctorName: { fontSize: 14, fontWeight: "700" },
  doctorSpecialtyBadge: { marginTop: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: "#f1f5f9" },
  doctorSpecialtyBadgeSelected: { backgroundColor: PRIMARY_BLUE_BORDER },
  doctorSpecialty: { fontSize: 11, lineHeight: 14, fontWeight: "600" },
  doctorSelectionIndicator: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: "#cbd5e1", alignItems: "center", justifyContent: "center" },
  doctorSelectionIndicatorSelected: { borderColor: PRIMARY_BLUE, backgroundColor: PRIMARY_BLUE },

  sectionLabel: { fontSize: 13, fontWeight: "700", marginBottom: 10 },
  dateStripContainer: { gap: 8, paddingVertical: 4 },
  dateLoadingMore: { width: 112, height: 68, alignItems: "center", justifyContent: "center", gap: 5 },
  dateLoadingMoreText: { color: PRIMARY_BLUE, fontSize: 9, lineHeight: 12, fontWeight: "700", textAlign: "center" },
  dateCard: { width: 62, height: 68, borderRadius: 13, borderWidth: 1.5, alignItems: "center", justifyContent: "center", paddingVertical: 5, backgroundColor: "#ffffff" },
  dateCardSelected: { backgroundColor: PRIMARY_BLUE, borderColor: PRIMARY_BLUE, elevation: 3, shadowColor: PRIMARY_BLUE, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.22, shadowRadius: 5 },
  dateCardDisabled: { backgroundColor: "#f8fafc", borderColor: "#f1f5f9" },
  dateDayName: { fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
  dateDayNumber: { fontSize: 18, fontWeight: "700", marginVertical: 2 },
  statusDot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
  availabilityHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 11, marginBottom: 7 },
  availabilityHeaderTitle: { flexDirection: "row", alignItems: "center", gap: 7 },
  availabilityHeaderIcon: { width: 28, height: 28, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: PRIMARY_BLUE_LIGHT },
  availabilityCountBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999, backgroundColor: PRIMARY_BLUE_BORDER },
  availabilityCountText: { color: PRIMARY_BLUE_DARK, fontSize: 10, lineHeight: 13, fontWeight: "800" },
  timePickerCard: { minHeight: 58, flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14, paddingHorizontal: 11, paddingVertical: 9, borderRadius: 13, borderWidth: 1, borderColor: PRIMARY_BLUE_BORDER, backgroundColor: PRIMARY_BLUE_LIGHT },
  timePickerCardDisabled: { borderColor: "#e2e8f0", backgroundColor: "#f8fafc" },
  timePickerIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff" },
  timePickerContent: { flex: 1 },
  timePickerLabel: { color: PRIMARY_BLUE, fontSize: 8, lineHeight: 11, fontWeight: "800", letterSpacing: 0.7 },
  timePickerValue: { marginTop: 2, fontSize: 12, lineHeight: 16, fontWeight: "700" },
  timeModalContent: { gap: 12 },
  timeModalDateBadge: { alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: PRIMARY_BLUE_LIGHT },
  timeModalDateText: { color: PRIMARY_BLUE_DARK, fontSize: 12, lineHeight: 16, fontWeight: "700" },
  timeModalList: { maxHeight: 226 },
  timeGridScroll: { marginBottom: 4 },
  timeGridScrollLimited: { height: 44 },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 8, paddingRight: 5, paddingBottom: 4 },
  availabilityState: { minHeight: 90, alignItems: "center", justifyContent: "center", gap: 10 },
  timeSlot: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, width: "48.5%", minHeight: 40, paddingHorizontal: 6, borderWidth: 1, borderColor: PRIMARY_BLUE_BORDER, borderRadius: 12, backgroundColor: PRIMARY_BLUE_LIGHT },
  timeSlotSelected: { backgroundColor: PRIMARY_BLUE, borderColor: PRIMARY_BLUE, elevation: 2, shadowColor: PRIMARY_BLUE, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  timeSlotDisabled: { backgroundColor: "#f8fafc", borderColor: "#f1f5f9" },
  timeSlotText: { fontSize: 13, fontWeight: "600" },
  textDisabled: { color: "#cbd5e1" },
  holdCountdownBanner: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 11, borderWidth: 1, borderColor: PRIMARY_BLUE_BORDER, backgroundColor: PRIMARY_BLUE_LIGHT },
  holdCountdownLabel: { flex: 1, color: PRIMARY_BLUE_DARK, fontSize: 11, lineHeight: 15, fontWeight: "600" },
  holdCountdownValue: { color: PRIMARY_BLUE_DARK, fontSize: 13, lineHeight: 17, fontWeight: "800", fontVariant: ["tabular-nums"] },

  registrationState: { minHeight: 112, alignItems: "center", justifyContent: "center", gap: 14 },
  registrationIcon: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center", backgroundColor: "#22c55e" },
  registrationIconError: { backgroundColor: "#ef4444" },
  registrationErrorMark: { color: "#ffffff", fontSize: 28, lineHeight: 32, fontWeight: "800" },
  registrationMessage: { fontSize: 14, lineHeight: 20, fontWeight: "600", textAlign: "center" },

  formLabel: { fontSize: 13, fontWeight: "700", marginBottom: 6 },
  formInput: { borderWidth: 1, borderRadius: 10, minHeight: 44, paddingHorizontal: 12, fontSize: 14, marginBottom: 12 },
  formTextArea: { minHeight: 78, textAlignVertical: "top", paddingTop: 10 },
  summaryCard: { backgroundColor: PRIMARY_BLUE_LIGHT, padding: 12, borderRadius: 10, marginVertical: 12, borderWidth: 1, borderColor: PRIMARY_BLUE_BORDER },
  summaryTitle: { fontSize: 13, fontWeight: "700", marginBottom: 4, color: PRIMARY_BLUE_DARK },
  summaryText: { fontSize: 12, color: PRIMARY_BLUE_DARK, marginTop: 2 },

  reviewContainer: { gap: 8, marginBottom: 14 },
  reviewTitleCard: { flexDirection: "row", alignItems: "center", gap: 11, paddingHorizontal: 13, paddingVertical: 11, borderRadius: 14, backgroundColor: PRIMARY_BLUE },
  reviewTitleIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.18)" },
  reviewTitleContent: { flex: 1 },
  reviewTitleEyebrow: { color: "#bae6fd", fontSize: 9, lineHeight: 12, fontWeight: "800", letterSpacing: 0.8 },
  reviewEyebrow: { color: PRIMARY_BLUE, fontSize: 9, lineHeight: 12, fontWeight: "800", letterSpacing: 0.8 },
  reviewMeetingTitle: { marginTop: 2, color: "#ffffff", fontSize: 15, lineHeight: 19, fontWeight: "800" },
  reviewDoctorCard: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 11, paddingVertical: 9, borderWidth: 1, borderRadius: 13, backgroundColor: "#f8fafc" },
  reviewDoctorAvatar: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: PRIMARY_BLUE },
  reviewDoctorContent: { flex: 1 },
  reviewDoctorName: { marginTop: 1, fontSize: 13, lineHeight: 17, fontWeight: "700" },
  reviewDoctorSpecialty: { marginTop: 1, fontSize: 11, lineHeight: 14, fontWeight: "500" },
  reviewScheduleRow: { flexDirection: "row", gap: 9 },
  reviewScheduleCard: { flex: 1, minHeight: 68, justifyContent: "center", paddingHorizontal: 11, paddingVertical: 8, borderRadius: 13, borderWidth: 1, borderColor: PRIMARY_BLUE_BORDER, backgroundColor: PRIMARY_BLUE_LIGHT },
  reviewScheduleLabel: { marginTop: 4, color: "#64748b", fontSize: 9, lineHeight: 12, fontWeight: "800", letterSpacing: 0.5 },
  reviewScheduleValue: { marginTop: 2, color: PRIMARY_BLUE_DARK, fontSize: 11, lineHeight: 15, fontWeight: "700" },
  reviewReasonCard: { paddingHorizontal: 11, paddingVertical: 9, borderRadius: 13, backgroundColor: "#fff7ed", borderWidth: 1, borderColor: "#fed7aa" },
  reviewReasonHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  reviewReasonLabel: { color: "#334155", fontSize: 11, fontWeight: "800" },
  reviewReasonText: { color: "#64748b", fontSize: 12, lineHeight: 17 },

  nextButton: { backgroundColor: PRIMARY_BLUE, borderRadius: 12, height: 48, flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center" },
  confirmButton: { backgroundColor: PRIMARY_BLUE, borderRadius: 12, height: 48, flexDirection: "row", gap: 7, alignItems: "center", justifyContent: "center" },
  confirmButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  buttonDisabled: { opacity: 0.45 },
});
