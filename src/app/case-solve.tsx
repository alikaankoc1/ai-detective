import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import {
  fetchCase,
  fetchInvestigationState,
  submitCaseSolve,
} from "@/services/cases";
import { getSolvedCaseIds } from "@/store/playerProgress";
import { detectiveTheme as t } from "@/constants/theme";
import { getCaseCover } from "@/constants/images";
import { buildEvidenceViews } from "@/utils/evidence-presentation";
import { isCasePlayable, resolveCaseId } from "@/utils/caseRoute";
import type { PlayerSafeCase, Suspect } from "@/types/case";
import type { EvidenceView } from "@/types/evidence-view";
import type { InvestigationState } from "@/types/investigation";

/** Oyuncu hipotezleri — canon motive metni değil; serbest metin düzenlenebilir. */
const MOTIVE_HYPOTHESES_DEFAULT = [
  "Maddi çıkar veya iş anlaşmazlığı",
  "Kişisel intikam",
  "Bir sırrın açığa çıkmasını engellemek",
  "Borç baskısı ve tehdit",
  "Kaza sonrası örtbas",
] as const;

const MOTIVE_HYPOTHESES_BY_CASE: Record<string, readonly string[]> = {
  "case-002": [
    "Borç baskısıyla kasa anahtarını çalıp aidat nakitine ulaşmak",
    "Kart borcu yüzünden anahtarı çalmak",
    "Kişisel intikam",
  ],
};

function motiveHypothesesFor(caseId: string): readonly string[] {
  return MOTIVE_HYPOTHESES_BY_CASE[caseId] ?? MOTIVE_HYPOTHESES_DEFAULT;
}

/** Cinayet / hırsızlık vakalarına göre solve metinleri. */
function solveCopyFor(caseId: string) {
  if (caseId === "case-002") {
    return {
      lead: "Sorumluyu seç, motifini yaz, keşfettiğin delillerle dosyayı kilitle.",
      suspectTitle: "Sorumlu seçimi",
      suspectHint: "Şüphelilerden birini suçla",
      ctaHint: "Sorumlu, motif ve en az bir delil seç",
    };
  }
  return {
    lead: "Katili seç, motifini yaz, keşfettiğin delillerle dosyayı kilitle.",
    suspectTitle: "Katil seçimi",
    suspectHint: "Şüphelilerden birini suçla",
    ctaHint: "Katil, motif ve en az bir delil seç",
  };
}

function LoadingState() {
  return (
    <View style={styles.stateCenter}>
      <ActivityIndicator color={t.colors.gold} size="large" />
      <Text style={styles.stateHint}>Suçlama dosyası hazırlanıyor…</Text>
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
      <Text style={styles.errorTitle}>Dosya açılamadı</Text>
      <Text style={styles.errorBody}>{message}</Text>
      <Pressable onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryText}>Yeniden dene</Text>
      </Pressable>
    </View>
  );
}

function SectionHeader({
  index,
  title,
  hint,
}: {
  index: string;
  title: string;
  hint?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIndexWrap}>
        <Text style={styles.sectionIndex}>{index}</Text>
      </View>
      <View style={styles.sectionTitleWrap}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
      </View>
    </View>
  );
}

function SuspectPick({
  suspect,
  order,
  selected,
  onSelect,
  delay,
}: {
  suspect: Suspect;
  order: number;
  selected: boolean;
  onSelect: () => void;
  delay: number;
}) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(550)}>
      <Pressable
        onPress={onSelect}
        style={({ pressed }) => [
          styles.suspectPick,
          selected && styles.suspectPickSelected,
          pressed && styles.cardPressed,
        ]}
      >
        <LinearGradient
          colors={
            selected
              ? ["rgba(201, 162, 39, 0.22)", "rgba(18, 28, 51, 0.96)"]
              : ["rgba(26, 39, 68, 0.98)", "rgba(8, 14, 28, 0.96)"]
          }
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.suspectPickRow}>
          <View style={[styles.avatar, selected && styles.avatarSelected]}>
            <Text style={styles.avatarText}>
              {suspect.name
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")}
            </Text>
          </View>
          <View style={styles.suspectPickBody}>
            <Text style={styles.suspectOrder}>
              ŞÜPHELİ {order.toString().padStart(2, "0")}
            </Text>
            <Text style={styles.suspectName}>{suspect.name}</Text>
            <Text style={styles.suspectJob}>
              {suspect.occupation}
              {suspect.age ? ` · ${suspect.age}` : ""}
            </Text>
          </View>
          <View style={[styles.checkRing, selected && styles.checkRingOn]}>
            {selected ? (
              <Ionicons name="checkmark" size={16} color={t.colors.void} />
            ) : null}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function EvidencePick({
  evidence,
  selected,
  onToggle,
  delay,
}: {
  evidence: EvidenceView;
  selected: boolean;
  onToggle: () => void;
  delay: number;
}) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(550)}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [
          styles.evidencePick,
          selected && styles.evidencePickSelected,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={[styles.evidenceRail, selected && styles.evidenceRailOn]} />
        <View style={styles.evidencePickBody}>
          <View style={styles.evidenceTopRow}>
            <Text style={styles.evidenceCatalog}>{evidence.catalogNumber}</Text>
            <Text style={styles.evidenceCategory}>{evidence.categoryLabel}</Text>
          </View>
          <Text style={styles.evidenceName}>{evidence.name}</Text>
          <Text style={styles.evidencePlace} numberOfLines={1}>
            {evidence.discoveryLocation}
          </Text>
        </View>
        <View style={[styles.checkRing, selected && styles.checkRingOn]}>
          {selected ? (
            <Ionicons name="checkmark" size={16} color={t.colors.void} />
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function CaseSolveScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const horizontal = Math.max(t.spacing.lg, width * 0.05);
  const params = useLocalSearchParams<{ caseId?: string | string[] }>();
  const caseId = resolveCaseId(params.caseId);
  const playable = isCasePlayable(caseId, getSolvedCaseIds());

  const [caseData, setCaseData] = useState<PlayerSafeCase | null>(null);
  const [investigation, setInvestigation] = useState<InvestigationState | null>(
    null
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>([]);
  const [motive, setMotive] = useState("");
  const [activeHypothesis, setActiveHypothesis] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!playable) {
      setLoading(false);
      setLoadError(
        "Bu vakayı açmak için önce Case 001 dosyasını çözmen gerekiyor."
      );
      setCaseData(null);
      setInvestigation(null);
      return;
    }

    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchCase(caseId);
      const state = await fetchInvestigationState(data.meta.id);
      setCaseData(data);
      setInvestigation(state);
      setSelectedSuspectId(null);
      setSelectedEvidenceIds([]);
      setMotive("");
      setActiveHypothesis(null);
      setSubmitError(null);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  }, [caseId, playable]);

  useEffect(() => {
    void load();
  }, [load]);

  const discoveredEvidence = useMemo(() => {
    if (!caseData || !investigation) return [] as EvidenceView[];
    const views = buildEvidenceViews(caseData);
    const discovered = new Set(investigation.discoveredEvidenceIds);
    return views.filter((item) => discovered.has(item.id));
  }, [caseData, investigation]);

  const canSubmit =
    Boolean(selectedSuspectId) &&
    motive.trim().length >= 8 &&
    selectedEvidenceIds.length > 0 &&
    !submitting;

  const toggleEvidence = (id: string) => {
    setSubmitError(null);
    setSelectedEvidenceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onSelectHypothesis = (text: string) => {
    setActiveHypothesis(text);
    setMotive(text);
    setSubmitError(null);
  };

  const onSubmit = async () => {
    if (!caseData || !selectedSuspectId || !canSubmit || !investigation) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitCaseSolve(caseData.meta.id, {
        suspectId: selectedSuspectId,
        motive: motive.trim(),
        evidenceIds: selectedEvidenceIds,
      });

      router.replace({
        pathname: "/case-result",
        params: {
          caseId: caseData.meta.id,
          result: result.result,
          score: String(result.score),
          xp: String(Math.max(25, Math.round(result.score * 1.2))),
          evidence: String(investigation.discoveredEvidenceIds.length),
          contradictions: String(investigation.discoveredContradictionIds.length),
        },
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Suçlama gönderilemedi."
      );
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient
          colors={[t.colors.void, t.colors.navyDeep, t.colors.ink]}
          style={StyleSheet.absoluteFill}
        />
        <LoadingState />
      </View>
    );
  }

  if (loadError || !caseData || !investigation) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient
          colors={[t.colors.void, t.colors.navyDeep, t.colors.ink]}
          style={StyleSheet.absoluteFill}
        />
        <ErrorState
          message={loadError ?? "Vaka verisi eksik."}
          onRetry={() => void load()}
        />
      </View>
    );
  }

  const copy = solveCopyFor(caseData.meta.id);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={[t.colors.void, t.colors.navyDeep, "#0B1529"]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + t.spacing.lg,
              paddingBottom: insets.bottom + 120,
              paddingHorizontal: horizontal,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeIn.duration(500)}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backRow,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Ionicons name="chevron-back" size={18} color={t.colors.goldSoft} />
              <Text style={styles.backText}>Geri</Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(60).duration(650)}>
            <View style={styles.heroCard}>
              <Image
                source={getCaseCover(caseData.meta.id)}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                transition={400}
              />
              <LinearGradient
                colors={[...t.media.cardWash]}
                locations={[...t.media.cardLocations]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.heroVisualBreath} />
              <View style={styles.heroTextBlock}>
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>SUÇLAMA ODASI</Text>
              </View>
              <Text style={styles.screenKicker}>{caseData.meta.id.toUpperCase()}</Text>
              <Text style={styles.screenTitle}>Vakayı çöz</Text>
              <Text style={styles.screenLead}>
                {copy.lead}
              </Text>
              </View>
            </View>
          </Animated.View>

          <SectionHeader
            index="01"
            title={copy.suspectTitle}
            hint={copy.suspectHint}
          />
          {caseData.suspects.map((suspect, index) => (
            <SuspectPick
              key={suspect.id}
              suspect={suspect}
              order={index + 1}
              selected={selectedSuspectId === suspect.id}
              delay={120 + index * 70}
              onSelect={() => {
                setSelectedSuspectId(suspect.id);
                setSubmitError(null);
              }}
            />
          ))}

          <SectionHeader
            index="02"
            title="Motif"
            hint="Hipotez seç veya kendi açıklamanı yaz"
          />
          <Animated.View entering={FadeInUp.delay(280).duration(550)}>
            <View style={styles.chipRow}>
              {motiveHypothesesFor(caseData.meta.id).map((item) => {
                const active = activeHypothesis === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => onSelectHypothesis(item)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              value={motive}
              onChangeText={(value) => {
                setMotive(value);
                setActiveHypothesis(null);
                setSubmitError(null);
              }}
              placeholder="Suçun arkasındaki nedeni detaylandır…"
              placeholderTextColor={t.colors.mist}
              multiline
              style={styles.motiveInput}
              textAlignVertical="top"
            />
          </Animated.View>

          <SectionHeader
            index="03"
            title="Deliller"
            hint={
              discoveredEvidence.length > 0
                ? `${discoveredEvidence.length} keşfedilmiş delil`
                : "Henüz keşfedilmiş delil yok"
            }
          />
          {discoveredEvidence.length === 0 ? (
            <Animated.View entering={FadeIn.delay(320).duration(500)}>
              <View style={styles.emptyEvidence}>
                <Ionicons
                  name="folder-open-outline"
                  size={28}
                  color={t.colors.goldDim}
                />
                <Text style={styles.emptyEvidenceTitle}>Dosya boş</Text>
                <Text style={styles.emptyEvidenceBody}>
                  Suçlamada kullanmak için önce soruşturmada delil keşfetmen
                  gerekiyor. Gizli deliller burada görünmez.
                </Text>
              </View>
            </Animated.View>
          ) : (
            discoveredEvidence.map((item, index) => (
              <EvidencePick
                key={item.id}
                evidence={item}
                selected={selectedEvidenceIds.includes(item.id)}
                delay={300 + index * 60}
                onToggle={() => toggleEvidence(item.id)}
              />
            ))
          )}

          {submitError ? (
            <Animated.View entering={FadeIn.duration(300)}>
              <View style={styles.submitErrorBox}>
                <Text style={styles.submitErrorText}>{submitError}</Text>
              </View>
            </Animated.View>
          ) : null}
        </ScrollView>

        <View
          style={[
            styles.ctaBar,
            { paddingBottom: Math.max(insets.bottom, t.spacing.md) },
          ]}
        >
          <LinearGradient
            colors={["rgba(5, 7, 13, 0)", "rgba(5, 7, 13, 0.92)", t.colors.void]}
            style={StyleSheet.absoluteFill}
          />
          <Pressable
            disabled={!canSubmit}
            onPress={() => void onSubmit()}
            style={({ pressed }) => [
              styles.ctaButton,
              !canSubmit && styles.ctaDisabled,
              pressed && canSubmit && styles.ctaPressed,
            ]}
          >
            <LinearGradient
              colors={
                canSubmit
                  ? ["#E0C56A", "#C9A227", "#9A7A1A"]
                  : ["rgba(26, 39, 68, 0.9)", "rgba(18, 28, 51, 0.95)"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            {submitting ? (
              <ActivityIndicator color={t.colors.void} />
            ) : (
              <>
                <Ionicons
                  name="flash"
                  size={18}
                  color={canSubmit ? t.colors.void : t.colors.mist}
                />
                <Text
                  style={[styles.ctaText, !canSubmit && styles.ctaTextDisabled]}
                >
                  VAKAYI ÇÖZ
                </Text>
              </>
            )}
          </Pressable>
          <Text style={styles.ctaHint}>
            {canSubmit
              ? `${selectedEvidenceIds.length} delil · motif hazır`
              : copy.ctaHint}
          </Text>
        </View>
      </KeyboardAvoidingView>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: t.spacing.md,
  },
  stateCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: t.spacing.xl,
    gap: t.spacing.md,
  },
  stateHint: {
    fontFamily: t.typography.body,
    color: t.colors.creamMuted,
    fontSize: 14,
  },
  errorTitle: {
    fontFamily: t.typography.hero,
    color: t.colors.cream,
    fontSize: 26,
    letterSpacing: t.typeRhythm.heroTracking,
    textAlign: "center",
  },
  errorBody: {
    fontFamily: t.typography.body,
    color: t.colors.creamMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  retryButton: {
    marginTop: t.spacing.sm,
    borderWidth: 1,
    borderColor: t.colors.gold,
    borderRadius: t.radius.sm,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.sm,
  },
  retryText: {
    fontFamily: t.typography.labelStrong,
    color: t.colors.goldSoft,
    letterSpacing: 1,
    fontSize: 12,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    marginBottom: t.spacing.xs,
  },
  backText: {
    fontFamily: t.typography.label,
    color: t.colors.goldSoft,
    fontSize: 13,
    letterSpacing: 0.6,
  },
  heroCard: {
    minHeight: 200,
    borderRadius: t.radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: t.colors.line,
    justifyContent: "flex-end",
    marginBottom: t.spacing.sm,
  },
  heroVisualBreath: {
    minHeight: 72,
  },
  heroTextBlock: {
    padding: t.spacing.lg,
    paddingTop: t.spacing.sm,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    backgroundColor: "rgba(5, 7, 13, 0.45)",
    borderWidth: 1,
    borderColor: t.colors.goldDim,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: t.spacing.sm,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: t.colors.gold,
  },
  liveText: {
    fontFamily: t.typography.labelStrong,
    color: t.colors.goldSoft,
    fontSize: 10,
    letterSpacing: t.typeRhythm.kickerTracking,
  },
  screenKicker: {
    fontFamily: t.typography.labelStrong,
    color: t.colors.mist,
    fontSize: 11,
    letterSpacing: t.typeRhythm.kickerTracking,
    marginBottom: 4,
  },
  screenTitle: {
    fontFamily: t.typography.hero,
    color: t.colors.cream,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: t.typeRhythm.heroTracking,
  },
  screenLead: {
    marginTop: 8,
    fontFamily: t.typography.body,
    color: t.colors.creamMuted,
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 320,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.sm,
    marginTop: t.spacing.md,
    marginBottom: t.spacing.xs,
  },
  sectionIndexWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: t.colors.goldDim,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.goldFaint,
  },
  sectionIndex: {
    fontFamily: t.typography.label,
    color: t.colors.gold,
    fontSize: 11,
    letterSpacing: 1,
  },
  sectionTitleWrap: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    fontFamily: t.typography.title,
    color: t.colors.cream,
    fontSize: 22,
    letterSpacing: t.typeRhythm.titleTracking,
  },
  sectionHint: {
    fontFamily: t.typography.body,
    color: t.colors.mist,
    fontSize: 12,
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  suspectPick: {
    borderRadius: t.radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: t.colors.line,
    marginBottom: t.spacing.sm,
  },
  suspectPickSelected: {
    borderColor: t.colors.gold,
  },
  suspectPickRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.md,
    padding: t.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: t.colors.goldDim,
    backgroundColor: t.colors.navyLift,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarSelected: {
    borderColor: t.colors.gold,
    backgroundColor: "rgba(201, 162, 39, 0.18)",
  },
  avatarText: {
    fontFamily: t.typography.label,
    color: t.colors.goldSoft,
    fontSize: 14,
    letterSpacing: 1,
  },
  suspectPickBody: {
    flex: 1,
    gap: 2,
  },
  suspectOrder: {
    fontFamily: t.typography.labelStrong,
    color: t.colors.mist,
    fontSize: 10,
    letterSpacing: t.typeRhythm.kickerTracking,
  },
  suspectName: {
    fontFamily: t.typography.title,
    color: t.colors.cream,
    fontSize: 20,
    letterSpacing: t.typeRhythm.titleTracking,
  },
  suspectJob: {
    fontFamily: t.typography.body,
    color: t.colors.creamMuted,
    fontSize: 13,
  },
  checkRing: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: t.colors.goldDim,
    alignItems: "center",
    justifyContent: "center",
  },
  checkRingOn: {
    backgroundColor: t.colors.gold,
    borderColor: t.colors.gold,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: t.spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: t.colors.line,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(18, 28, 51, 0.85)",
  },
  chipActive: {
    borderColor: t.colors.gold,
    backgroundColor: t.colors.goldFaint,
  },
  chipText: {
    fontFamily: t.typography.bodyMedium,
    color: t.colors.creamMuted,
    fontSize: 12,
  },
  chipTextActive: {
    color: t.colors.goldSoft,
  },
  motiveInput: {
    minHeight: 110,
    borderRadius: t.radius.md,
    borderWidth: 1,
    borderColor: t.colors.line,
    backgroundColor: "rgba(10, 18, 36, 0.9)",
    paddingHorizontal: t.spacing.md,
    paddingVertical: t.spacing.md,
    color: t.colors.cream,
    fontFamily: t.typography.body,
    fontSize: 15,
    lineHeight: 22,
  },
  evidencePick: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: t.radius.md,
    borderWidth: 1,
    borderColor: t.colors.line,
    backgroundColor: "rgba(18, 28, 51, 0.92)",
    overflow: "hidden",
    marginBottom: t.spacing.sm,
    paddingRight: t.spacing.md,
  },
  evidencePickSelected: {
    borderColor: t.colors.gold,
    backgroundColor: "rgba(201, 162, 39, 0.08)",
  },
  evidenceRail: {
    width: 4,
    alignSelf: "stretch",
    backgroundColor: t.colors.goldDim,
    marginRight: t.spacing.md,
  },
  evidenceRailOn: {
    backgroundColor: t.colors.gold,
  },
  evidencePickBody: {
    flex: 1,
    paddingVertical: t.spacing.md,
    gap: 3,
  },
  evidenceTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: t.spacing.sm,
  },
  evidenceCatalog: {
    fontFamily: t.typography.label,
    color: t.colors.gold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  evidenceCategory: {
    fontFamily: t.typography.body,
    color: t.colors.mist,
    fontSize: 11,
  },
  evidenceName: {
    fontFamily: t.typography.title,
    color: t.colors.cream,
    fontSize: 18,
    letterSpacing: t.typeRhythm.titleTracking,
  },
  evidencePlace: {
    fontFamily: t.typography.body,
    color: t.colors.creamMuted,
    fontSize: 12,
  },
  emptyEvidence: {
    borderWidth: 1,
    borderColor: t.colors.line,
    borderRadius: t.radius.md,
    padding: t.spacing.lg,
    alignItems: "center",
    gap: t.spacing.sm,
    backgroundColor: "rgba(18, 28, 51, 0.7)",
  },
  emptyEvidenceTitle: {
    fontFamily: t.typography.title,
    color: t.colors.cream,
    fontSize: 20,
    letterSpacing: t.typeRhythm.titleTracking,
  },
  emptyEvidenceBody: {
    fontFamily: t.typography.body,
    color: t.colors.creamMuted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  submitErrorBox: {
    borderWidth: 1,
    borderColor: "rgba(196, 120, 120, 0.55)",
    backgroundColor: "rgba(139, 58, 58, 0.22)",
    borderRadius: t.radius.sm,
    padding: t.spacing.md,
  },
  submitErrorText: {
    fontFamily: t.typography.body,
    color: "#E8B4B4",
    fontSize: 13,
    lineHeight: 20,
  },
  ctaBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: t.spacing.lg,
    paddingTop: t.spacing.xl,
    gap: 8,
  },
  ctaButton: {
    height: 56,
    borderRadius: t.radius.md,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(201, 162, 39, 0.55)",
  },
  ctaDisabled: {
    borderColor: t.colors.line,
  },
  ctaPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  ctaText: {
    fontFamily: t.typography.labelStrong,
    color: t.colors.void,
    fontSize: 15,
    letterSpacing: t.typeRhythm.kickerTracking,
  },
  ctaTextDisabled: {
    color: t.colors.mist,
  },
  ctaHint: {
    fontFamily: t.typography.body,
    color: t.colors.mist,
    fontSize: 12,
    textAlign: "center",
    marginBottom: 4,
  },
});
