import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { askSuspect, checkContradiction, fetchCase } from "@/services/cases";
import { detectiveTheme as t } from "@/constants/theme";
import { getCaseCover } from "@/constants/images";
import { buildEvidenceViews } from "@/utils/evidence-presentation";
import { resolveCaseId } from "@/utils/caseRoute";
import type { Case, Suspect } from "@/types/case";
import type { EvidenceView } from "@/types/evidence-view";
import type { PlayerSafeContradiction } from "@/types/contradiction";

type ChatRole = "player" | "suspect" | "system" | "contradiction" | "no_contradiction";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  contradiction?: PlayerSafeContradiction;
};

function LoadingState() {
  return (
    <View style={styles.stateCenter}>
      <ActivityIndicator color={t.colors.gold} size="large" />
      <Text style={styles.stateHint}>Sorgu odası hazırlanıyor…</Text>
    </View>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.stateCenter}>
      <Text style={styles.errorTitle}>Sorgu açılamadı</Text>
      <Text style={styles.errorBody}>{message}</Text>
      <Pressable onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryText}>Yeniden dene</Text>
      </Pressable>
    </View>
  );
}

function EmptySuspectState({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.stateCenter}>
      <Text style={styles.errorTitle}>Şüpheli bulunamadı</Text>
      <Text style={styles.errorBody}>
        Seçilen dosya bu vakada yok. Soruşturma ekranına dönün.
      </Text>
      <Pressable onPress={onBack} style={styles.retryButton}>
        <Text style={styles.retryText}>Geri dön</Text>
      </Pressable>
    </View>
  );
}

function DossierPanel({
  caseData,
  suspect,
}: {
  caseData: Case;
  suspect: Suspect;
}) {
  const relatedEvidence = caseData.evidence.filter((item) =>
    item.relatedSuspectIds.includes(suspect.id)
  );
  const knownStatements = caseData.statements.filter(
    (item) => item.suspectId === suspect.id
  );

  return (
    <Animated.View entering={FadeInDown.delay(80).duration(650)}>
      <View style={styles.dossierCard}>
        <LinearGradient
          colors={["rgba(26, 39, 68, 0.98)", "rgba(8, 14, 28, 0.96)"]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.dossierHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {suspect.name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")}
            </Text>
          </View>
          <View style={styles.dossierIdentity}>
            <Text style={styles.dossierKicker}>SORGU ALTINDA</Text>
            <Text style={styles.dossierName}>{suspect.name}</Text>
            <Text style={styles.dossierMeta}>
              {suspect.occupation}
              {suspect.age ? ` · ${suspect.age}` : ""}
            </Text>
          </View>
        </View>

        <Text style={styles.dossierBio}>{suspect.biography}</Text>

        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>KURBANLA BAĞ</Text>
          <Text style={styles.infoValue}>{suspect.relationshipToVictim}</Text>
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>BİLİNEN MAZERET</Text>
          <Text style={styles.infoQuote}>“{suspect.claimedAlibi}”</Text>
        </View>

        {relatedEvidence.length > 0 ? (
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>İLİŞKİLİ DELİLLER</Text>
            {relatedEvidence.map((item) => (
              <Text key={item.id} style={styles.bullet}>
                • {item.name}
              </Text>
            ))}
          </View>
        ) : null}

        {knownStatements.length > 0 ? (
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>DOSYADAKİ İFADELER</Text>
            {knownStatements.map((item) => (
              <Text key={item.id} style={styles.infoQuote}>
                “{item.text}”
              </Text>
            ))}
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

function severityLabel(severity: PlayerSafeContradiction["severity"]): string {
  switch (severity) {
    case "critical":
      return "KRİTİK";
    case "high":
      return "YÜKSEK";
    case "medium":
      return "ORTA";
    case "low":
      return "DÜŞÜK";
  }
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "contradiction" && message.contradiction) {
    return (
      <Animated.View entering={FadeInUp.duration(500)}>
        <View style={styles.contradictionCard}>
          <LinearGradient
            colors={["rgba(201, 162, 39, 0.22)", "rgba(18, 28, 51, 0.95)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.contradictionHeader}>
            <View style={styles.contradictionBadge}>
              <Ionicons name="alert-circle" size={14} color={t.colors.void} />
              <Text style={styles.contradictionBadgeText}>ÇELİŞKİ YAKALANDI</Text>
            </View>
            <View style={styles.severityPill}>
              <Text style={styles.severityText}>
                {severityLabel(message.contradiction.severity)}
              </Text>
            </View>
          </View>
          <Text style={styles.contradictionBody}>
            {message.contradiction.contradictionDescription}
          </Text>
        </View>
      </Animated.View>
    );
  }

  if (message.role === "no_contradiction") {
    return (
      <Animated.View entering={FadeIn.duration(400)}>
        <View style={styles.noContradictionCard}>
          <Ionicons name="remove-circle-outline" size={16} color={t.colors.mist} />
          <Text style={styles.noContradictionText}>{message.text}</Text>
        </View>
      </Animated.View>
    );
  }

  const isPlayer = message.role === "player";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <View style={styles.systemBubble}>
        <Text style={styles.systemText}>{message.text}</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.bubble,
        isPlayer ? styles.playerBubble : styles.suspectBubble,
      ]}
    >
      <Text style={styles.bubbleRole}>
        {isPlayer ? "SEN" : "İFADE"}
      </Text>
      <Text style={styles.bubbleText}>{message.text}</Text>
    </View>
  );
}

function EvidencePickerModal({
  visible,
  evidenceList,
  sending,
  onClose,
  onSelect,
}: {
  visible: boolean;
  evidenceList: EvidenceView[];
  sending: boolean;
  onClose: () => void;
  onSelect: (evidence: EvidenceView) => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View
          style={[
            styles.modalSheet,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <LinearGradient
            colors={["rgba(26, 39, 68, 0.98)", "rgba(8, 14, 28, 1)"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalKicker}>DELİL SEÇ</Text>
              <Text style={styles.modalTitle}>Yüzleştirme</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10} style={styles.modalClose}>
              <Ionicons name="close" size={18} color={t.colors.creamMuted} />
            </Pressable>
          </View>
          <Text style={styles.modalHint}>
            Bir delil seç. Şüpheli yalnızca bu delilin açık bilgilerine tepki verir.
          </Text>

          <ScrollView
            style={styles.modalList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {evidenceList.map((item) => (
              <Pressable
                key={item.id}
                disabled={sending}
                onPress={() => onSelect(item)}
                style={({ pressed }) => [
                  styles.evidenceOption,
                  pressed && styles.evidenceOptionPressed,
                ]}
              >
                <View style={styles.evidenceOptionTop}>
                  <Text style={styles.evidenceOptionCatalog}>
                    {item.catalogNumber}
                  </Text>
                  <Text style={styles.evidenceOptionCategory}>
                    {item.categoryLabel}
                  </Text>
                </View>
                <Text style={styles.evidenceOptionName}>{item.name}</Text>
                <Text style={styles.evidenceOptionDesc} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.evidenceOptionCue}>
                  <Ionicons name="flash-outline" size={12} color={t.colors.gold} />
                  <Text style={styles.evidenceOptionCueText}>YÜZLEŞTİR</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function InterrogationRoom({
  caseData,
  suspect,
}: {
  caseData: Case;
  suspect: Suspect;
}) {
  const insets = useSafeAreaInsets();
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "sys-1",
      role: "system",
      text: `${suspect.name} karşınızda. Soru sorun veya bir delille yüzleştirin.`,
    },
  ]);

  const evidenceList = useMemo(
    () => buildEvidenceViews(caseData),
    [caseData]
  );

  const canAsk = question.trim().length > 0 && !sending;

  const ask = async () => {
    const trimmed = question.trim();
    if (!trimmed || sending) return;

    const playerMessage: ChatMessage = {
      id: `p-${Date.now()}`,
      role: "player",
      text: trimmed,
    };

    setMessages((prev) => [...prev, playerMessage]);
    setQuestion("");
    setSendError(null);
    setSending(true);

    try {
      const result = await askSuspect({
        caseId: caseData.meta.id,
        suspectId: suspect.id,
        playerQuestion: trimmed,
      });

      const reply: ChatMessage = {
        id: `s-${Date.now()}`,
        role: "suspect",
        text: result.reply,
      };
      setMessages((prev) => [...prev, reply]);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "İfade alınamadı.";
      setSendError(message);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "system",
          text: `Bağlantı hatası: ${message} Soruyu yeniden deneyebilirsin.`,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const confrontWithEvidence = async (evidence: EvidenceView) => {
    if (sending) return;

    setPickerOpen(false);
    setSendError(null);
    setSending(true);

    const playerMessage: ChatMessage = {
      id: `p-${Date.now()}`,
      role: "player",
      text: `Delille yüzleştirildi: [${evidence.catalogNumber}] ${evidence.name}`,
    };
    setMessages((prev) => [...prev, playerMessage]);

    try {
      const result = await askSuspect({
        caseId: caseData.meta.id,
        suspectId: suspect.id,
        evidenceId: evidence.id,
        playerQuestion: question.trim() || undefined,
      });

      if (question.trim()) {
        setQuestion("");
      }

      const reply: ChatMessage = {
        id: `s-${Date.now()}`,
        role: "suspect",
        text: result.reply,
      };
      setMessages((prev) => [...prev, reply]);

      try {
        const check = await checkContradiction({
          caseId: caseData.meta.id,
          suspectId: suspect.id,
          evidenceId: evidence.id,
        });

        if (check.found && check.contradiction) {
          setMessages((prev) => [
            ...prev,
            {
              id: `c-${Date.now()}`,
              role: "contradiction",
              text: check.contradiction.contradictionDescription,
              contradiction: check.contradiction,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `nc-${Date.now()}`,
              role: "no_contradiction",
              text: "Bu delil şu an bir çelişki ortaya çıkarmadı.",
            },
          ]);
        }
      } catch (checkErr: unknown) {
        const checkMessage =
          checkErr instanceof Error
            ? checkErr.message
            : "Çelişki kontrolü yapılamadı.";
        setMessages((prev) => [
          ...prev,
          {
            id: `cerr-${Date.now()}`,
            role: "system",
            text: `İfade alındı; çelişki kontrolü başarısız: ${checkMessage}`,
          },
        ]);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Yüzleştirme başarısız.";
      setSendError(message);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "system",
          text: `Bağlantı hatası: ${message} Delili yeniden deneyebilirsin.`,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={{
          paddingTop: insets.top + 56,
          paddingBottom: t.spacing.md,
          paddingHorizontal: t.spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(500)}>
          <Text style={styles.caseChip}>
            {caseData.meta.id.toUpperCase()} · {caseData.meta.title}
          </Text>
          <Text style={styles.screenTitle}>İfade Odası</Text>
        </Animated.View>

        <DossierPanel caseData={caseData} suspect={suspect} />

        <Animated.View entering={FadeInUp.delay(180).duration(600)}>
          <Text style={styles.sectionLabel}>SORGU KAYDI</Text>
        </Animated.View>

        <View style={styles.transcript}>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {sending ? (
            <View style={styles.typingRow}>
              <ActivityIndicator color={t.colors.gold} size="small" />
              <Text style={styles.typingText}>İfade bekleniyor…</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View
        style={[
          styles.composer,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <LinearGradient
          colors={["transparent", "rgba(5, 7, 13, 0.95)", t.colors.void]}
          style={styles.composerFade}
          pointerEvents="none"
        />

        <Pressable
          onPress={() => setPickerOpen(true)}
          disabled={sending || evidenceList.length === 0}
          style={({ pressed }) => [
            styles.confrontButton,
            (sending || evidenceList.length === 0) && styles.confrontButtonDisabled,
            pressed && !sending && styles.confrontButtonPressed,
          ]}
        >
          <Ionicons name="flash-outline" size={14} color={t.colors.goldSoft} />
          <Text style={styles.confrontLabel}>DELİLLE YÜZLEŞTİR</Text>
        </Pressable>

        <View style={styles.inputRow}>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="Sorunu yaz…"
            placeholderTextColor={t.colors.mist}
            style={styles.input}
            multiline
            maxLength={280}
            editable={!sending}
            onSubmitEditing={() => {
              void ask();
            }}
            blurOnSubmit
          />
          <Pressable
            onPress={() => {
              void ask();
            }}
            disabled={!canAsk}
            style={({ pressed }) => [
              styles.askButton,
              !canAsk && styles.askButtonDisabled,
              pressed && canAsk && styles.askButtonPressed,
            ]}
          >
            <LinearGradient
              colors={
                canAsk
                  ? [t.colors.goldSoft, t.colors.gold, "#A8841A"]
                  : ["#3A3F4D", "#2A2F3C"]
              }
              style={styles.askGradient}
            >
              <Text
                style={[styles.askLabel, !canAsk && styles.askLabelDisabled]}
              >
                SOR
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
        {sendError ? (
          <Text style={styles.sendErrorText}>{sendError}</Text>
        ) : null}
      </View>

      <EvidencePickerModal
        visible={pickerOpen}
        evidenceList={evidenceList}
        sending={sending}
        onClose={() => setPickerOpen(false)}
        onSelect={(evidence) => {
          void confrontWithEvidence(evidence);
        }}
      />
    </KeyboardAvoidingView>
  );
}

export default function InterrogationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    suspectId?: string | string[];
    caseId?: string | string[];
  }>();
  const suspectId = Array.isArray(params.suspectId)
    ? params.suspectId[0]
    : params.suspectId;
  const caseId = resolveCaseId(params.caseId);

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setCaseData(null);

    fetchCase(caseId)
      .then((data) => {
        if (!cancelled) setCaseData(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Bilinmeyen hata");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey, caseId]);

  const suspect = useMemo(() => {
    if (!caseData || !suspectId) return null;
    return caseData.suspects.find((item) => item.id === suspectId) ?? null;
  }, [caseData, suspectId]);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      <LinearGradient
        colors={[t.colors.navyDeep, t.colors.void, "#02040A"]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      {caseData ? (
        <View style={styles.coverLayer} pointerEvents="none">
          <Image
            source={getCaseCover(caseData.meta.id)}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={500}
          />
          <LinearGradient
            colors={[...t.media.pageWash]}
            locations={[...t.media.pageLocations]}
            style={StyleSheet.absoluteFill}
          />
        </View>
      ) : null}

      <LinearGradient
        colors={["rgba(201, 162, 39, 0.07)", "transparent"]}
        style={styles.topGlow}
        pointerEvents="none"
      />

      <Pressable
        onPress={() => router.back()}
        style={[styles.backButton, { top: insets.top + 8 }]}
        hitSlop={12}
      >
        <Text style={styles.backText}>←</Text>
      </Pressable>

      {(!caseData && !error) ? (
        <LoadingState />
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={() => setReloadKey((key) => key + 1)}
        />
      ) : !suspectId || !suspect ? (
        <EmptySuspectState onBack={() => router.back()} />
      ) : (
        <InterrogationRoom caseData={caseData!} suspect={suspect} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: t.colors.void,
  },
  flex: {
    flex: 1,
  },
  coverLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "28%",
  },
  topGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  backButton: {
    position: "absolute",
    left: t.spacing.md,
    zIndex: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: t.colors.goldDim,
    backgroundColor: "rgba(10, 18, 36, 0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    color: t.colors.goldSoft,
    fontSize: 18,
    marginTop: -2,
  },
  caseChip: {
    fontFamily: t.typography.label,
    fontSize: 11,
    letterSpacing: 1.6,
    color: t.colors.gold,
    marginBottom: t.spacing.sm,
  },
  screenTitle: {
    fontFamily: t.typography.hero,
    fontSize: 32,
    letterSpacing: t.typeRhythm.heroTracking,
    color: t.colors.cream,
    marginBottom: t.spacing.lg,
  },
  dossierCard: {
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.line,
    padding: t.spacing.lg,
    overflow: "hidden",
    marginBottom: t.spacing.xl,
  },
  dossierHeader: {
    flexDirection: "row",
    gap: t.spacing.md,
    marginBottom: t.spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: t.colors.gold,
    backgroundColor: t.colors.goldFaint,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: t.typography.label,
    fontSize: 15,
    letterSpacing: 1,
    color: t.colors.goldSoft,
  },
  dossierIdentity: {
    flex: 1,
    justifyContent: "center",
  },
  dossierKicker: {
    fontFamily: t.typography.labelStrong,
    fontSize: 10,
    letterSpacing: t.typeRhythm.kickerTracking,
    color: t.colors.gold,
    marginBottom: 4,
  },
  dossierName: {
    fontFamily: t.typography.title,
    fontSize: 24,
    letterSpacing: t.typeRhythm.titleTracking,
    color: t.colors.cream,
  },
  dossierMeta: {
    fontFamily: t.typography.bodyMedium,
    fontSize: 13,
    color: t.colors.creamMuted,
    marginTop: 2,
  },
  dossierBio: {
    fontFamily: t.typography.body,
    fontSize: 14,
    lineHeight: 22,
    color: t.colors.creamMuted,
    marginBottom: t.spacing.md,
  },
  infoBlock: {
    marginBottom: t.spacing.md,
  },
  infoLabel: {
    fontFamily: t.typography.labelStrong,
    fontSize: 10,
    letterSpacing: t.typeRhythm.kickerTracking,
    color: t.colors.gold,
    marginBottom: 6,
  },
  infoValue: {
    fontFamily: t.typography.bodyMedium,
    fontSize: 14,
    lineHeight: 21,
    color: t.colors.cream,
  },
  infoQuote: {
    fontFamily: t.typography.displayItalic,
    fontSize: 15,
    lineHeight: 24,
    color: t.colors.cream,
    marginBottom: 8,
  },
  bullet: {
    fontFamily: t.typography.body,
    fontSize: 13,
    lineHeight: 20,
    color: t.colors.creamMuted,
    marginBottom: 4,
  },
  sectionLabel: {
    fontFamily: t.typography.labelStrong,
    fontSize: 11,
    letterSpacing: t.typeRhythm.kickerTracking,
    color: t.colors.gold,
    marginBottom: t.spacing.md,
  },
  transcript: {
    gap: t.spacing.sm,
    paddingBottom: 110,
  },
  bubble: {
    borderRadius: t.radius.md,
    padding: t.spacing.md,
    borderWidth: 1,
    maxWidth: "92%",
  },
  playerBubble: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(201, 162, 39, 0.14)",
    borderColor: t.colors.goldDim,
  },
  suspectBubble: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(18, 28, 51, 0.9)",
    borderColor: t.colors.line,
  },
  bubbleRole: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 1.6,
    color: t.colors.gold,
    marginBottom: 6,
  },
  bubbleText: {
    fontFamily: t.typography.body,
    fontSize: 14,
    lineHeight: 22,
    color: t.colors.cream,
  },
  systemBubble: {
    alignSelf: "center",
    paddingHorizontal: t.spacing.md,
    paddingVertical: t.spacing.sm,
    borderRadius: 999,
    backgroundColor: "rgba(18, 28, 51, 0.65)",
    borderWidth: 1,
    borderColor: "rgba(201, 162, 39, 0.2)",
    marginBottom: t.spacing.sm,
  },
  systemText: {
    fontFamily: t.typography.body,
    fontSize: 12,
    lineHeight: 18,
    color: t.colors.mist,
    textAlign: "center",
  },
  contradictionCard: {
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.gold,
    padding: t.spacing.md,
    overflow: "hidden",
    marginVertical: 4,
  },
  contradictionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: t.spacing.sm,
    marginBottom: t.spacing.sm,
  },
  contradictionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: t.colors.gold,
  },
  contradictionBadgeText: {
    fontFamily: t.typography.labelStrong,
    fontSize: 10,
    letterSpacing: 1.4,
    color: t.colors.void,
  },
  severityPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: t.colors.goldDim,
    backgroundColor: "rgba(5, 7, 13, 0.45)",
  },
  severityText: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 1.2,
    color: t.colors.goldSoft,
  },
  contradictionBody: {
    fontFamily: t.typography.body,
    fontSize: 14,
    lineHeight: 22,
    color: t.colors.cream,
  },
  noContradictionCard: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: "95%",
    paddingHorizontal: t.spacing.md,
    paddingVertical: t.spacing.sm + 2,
    borderRadius: t.radius.md,
    borderWidth: 1,
    borderColor: "rgba(243, 237, 224, 0.14)",
    backgroundColor: "rgba(18, 28, 51, 0.7)",
  },
  noContradictionText: {
    flex: 1,
    fontFamily: t.typography.body,
    fontSize: 12,
    lineHeight: 18,
    color: t.colors.mist,
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },
  typingText: {
    fontFamily: t.typography.body,
    fontSize: 12,
    color: t.colors.mist,
  },
  composer: {
    paddingHorizontal: t.spacing.lg,
    paddingTop: t.spacing.md,
  },
  composerFade: {
    ...StyleSheet.absoluteFill,
    top: -36,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: t.spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 52,
    maxHeight: 110,
    borderRadius: t.radius.md,
    borderWidth: 1,
    borderColor: t.colors.line,
    backgroundColor: "rgba(18, 28, 51, 0.92)",
    paddingHorizontal: t.spacing.md,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    color: t.colors.cream,
    fontFamily: t.typography.body,
    fontSize: 15,
  },
  askButton: {
    borderRadius: t.radius.md,
    overflow: "hidden",
  },
  askButtonDisabled: {
    opacity: 0.7,
  },
  askButtonPressed: {
    transform: [{ scale: 0.97 }],
  },
  askGradient: {
    minWidth: 76,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  askLabel: {
    fontFamily: t.typography.labelStrong,
    fontSize: 14,
    letterSpacing: t.typeRhythm.kickerTracking,
    color: t.colors.void,
  },
  askLabelDisabled: {
    color: t.colors.mist,
  },
  sendErrorText: {
    marginTop: t.spacing.sm,
    fontFamily: t.typography.body,
    fontSize: 12,
    lineHeight: 18,
    color: "#E0A0A0",
  },
  confrontButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: t.spacing.sm,
    paddingVertical: 12,
    borderRadius: t.radius.md,
    borderWidth: 1,
    borderColor: t.colors.goldDim,
    backgroundColor: t.colors.goldFaint,
  },
  confrontButtonDisabled: {
    opacity: 0.55,
  },
  confrontButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  confrontLabel: {
    fontFamily: t.typography.labelStrong,
    fontSize: 12,
    letterSpacing: t.typeRhythm.kickerTracking,
    color: t.colors.goldSoft,
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },
  modalSheet: {
    maxHeight: "78%",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: t.colors.line,
    overflow: "hidden",
    paddingHorizontal: t.spacing.lg,
    paddingTop: t.spacing.sm,
  },
  modalHandle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(243, 237, 224, 0.25)",
    marginBottom: t.spacing.md,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: t.spacing.sm,
  },
  modalKicker: {
    fontFamily: t.typography.labelStrong,
    fontSize: 10,
    letterSpacing: t.typeRhythm.kickerTracking,
    color: t.colors.gold,
    marginBottom: 4,
  },
  modalTitle: {
    fontFamily: t.typography.title,
    fontSize: 26,
    color: t.colors.cream,
  },
  modalClose: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(243, 237, 224, 0.16)",
  },
  modalHint: {
    fontFamily: t.typography.body,
    fontSize: 13,
    lineHeight: 20,
    color: t.colors.creamMuted,
    marginBottom: t.spacing.md,
  },
  modalList: {
    flexGrow: 0,
  },
  evidenceOption: {
    marginBottom: t.spacing.sm,
    padding: t.spacing.md,
    borderRadius: t.radius.md,
    borderWidth: 1,
    borderColor: t.colors.line,
    backgroundColor: "rgba(5, 7, 13, 0.45)",
  },
  evidenceOptionPressed: {
    opacity: 0.9,
    borderColor: t.colors.goldDim,
  },
  evidenceOptionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  evidenceOptionCatalog: {
    fontFamily: t.typography.label,
    fontSize: 11,
    letterSpacing: 1.4,
    color: t.colors.goldSoft,
  },
  evidenceOptionCategory: {
    fontFamily: t.typography.body,
    fontSize: 11,
    color: t.colors.mist,
  },
  evidenceOptionName: {
    fontFamily: t.typography.title,
    fontSize: 18,
    letterSpacing: t.typeRhythm.titleTracking,
    color: t.colors.cream,
    marginBottom: 4,
  },
  evidenceOptionDesc: {
    fontFamily: t.typography.body,
    fontSize: 13,
    lineHeight: 20,
    color: t.colors.creamMuted,
  },
  evidenceOptionCue: {
    marginTop: t.spacing.sm,
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  evidenceOptionCueText: {
    fontFamily: t.typography.labelStrong,
    fontSize: 11,
    letterSpacing: 1.5,
    color: t.colors.gold,
  },
  stateCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: t.spacing.xl,
  },
  stateHint: {
    marginTop: t.spacing.md,
    fontFamily: t.typography.bodyMedium,
    fontSize: 14,
    color: t.colors.mist,
  },
  errorTitle: {
    fontFamily: t.typography.hero,
    fontSize: 28,
    letterSpacing: t.typeRhythm.heroTracking,
    color: t.colors.cream,
    marginBottom: t.spacing.sm,
  },
  errorBody: {
    fontFamily: t.typography.body,
    fontSize: 14,
    lineHeight: 22,
    color: t.colors.creamMuted,
    textAlign: "center",
    marginBottom: t.spacing.lg,
  },
  retryButton: {
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.sm + 2,
    borderRadius: t.radius.sm,
    borderWidth: 1,
    borderColor: t.colors.gold,
    backgroundColor: t.colors.goldFaint,
  },
  retryText: {
    fontFamily: t.typography.labelStrong,
    fontSize: 13,
    letterSpacing: 1.5,
    color: t.colors.goldSoft,
  },
});
