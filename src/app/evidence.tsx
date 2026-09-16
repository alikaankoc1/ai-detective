import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { fetchCase, discoverCaseEvidence } from "@/services/cases";
import { detectiveTheme as t } from "@/constants/theme";
import { getCaseCover } from "@/constants/images";
import { findEvidenceView } from "@/utils/evidence-presentation";
import { resolveCaseId } from "@/utils/caseRoute";
import type { Case } from "@/types/case";
import type { EvidenceCategory, EvidenceView } from "@/types/evidence-view";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

function categoryIcon(category: EvidenceCategory): IoniconName {
  switch (category) {
    case "dijital":
      return "phone-portrait-outline";
    case "fiziksel":
      return "cube-outline";
    case "iz":
      return "footsteps-outline";
    case "belge":
      return "document-text-outline";
    default:
      return "search-outline";
  }
}

function LoadingState() {
  return (
    <View style={styles.stateCenter}>
      <ActivityIndicator color={t.colors.gold} size="large" />
      <Text style={styles.stateHint}>Delil torbası açılıyor…</Text>
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
      <Text style={styles.errorTitle}>Delil yüklenemedi</Text>
      <Text style={styles.errorBody}>{message}</Text>
      <Pressable onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryText}>Yeniden dene</Text>
      </Pressable>
    </View>
  );
}

function EmptyEvidenceState({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.stateCenter}>
      <Text style={styles.errorTitle}>Delil bulunamadı</Text>
      <Text style={styles.errorBody}>
        Bu kayıt aktif soruşturma dosyasında yok.
      </Text>
      <Pressable onPress={onBack} style={styles.retryButton}>
        <Text style={styles.retryText}>Geri dön</Text>
      </Pressable>
    </View>
  );
}

function DetailBlock({
  icon,
  label,
  children,
  delay,
}: {
  icon: IoniconName;
  label: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(650)}>
      <View style={styles.detailBlock}>
        <View style={styles.detailLabelRow}>
          <Ionicons name={icon} size={13} color={t.colors.gold} />
          <Text style={styles.detailLabel}>{label}</Text>
        </View>
        {children}
      </View>
    </Animated.View>
  );
}

function EvidenceContent({
  caseData,
  evidence,
}: {
  caseData: Case;
  evidence: EvidenceView;
}) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{
        paddingTop: insets.top + 56,
        paddingBottom: insets.bottom + t.spacing.xxl,
        paddingHorizontal: t.spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeIn.duration(500)}>
        <Text style={styles.caseChip}>
          {caseData.meta.id.toUpperCase()} · {caseData.meta.title}
        </Text>
        <Text style={styles.screenKicker}>DELİL İNCELEME</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(700)}>
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
          <View style={styles.heroTopRow}>
            <View style={styles.catalogPill}>
              <Text style={styles.catalogText}>{evidence.catalogNumber}</Text>
            </View>
            <View style={styles.categoryPill}>
              <Ionicons
                name={categoryIcon(evidence.category)}
                size={12}
                color={t.colors.goldSoft}
              />
              <Text style={styles.categoryText}>{evidence.categoryLabel}</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>{evidence.name}</Text>
          <Text style={styles.heroHint}>
            Torba mühürlü. İnceleme notları kayda geçirildi.
          </Text>
          </View>
        </View>
      </Animated.View>

      <DetailBlock icon="document-text-outline" label="AÇIKLAMA" delay={160}>
        <Text style={styles.detailBody}>{evidence.description}</Text>
      </DetailBlock>

      <DetailBlock icon="location-outline" label="BULUNDUĞU YER" delay={220}>
        <Text style={styles.detailBody}>{evidence.discoveryLocation}</Text>
      </DetailBlock>

      <DetailBlock icon="people-outline" label="BAĞLANTILI ŞÜPHELİLER" delay={280}>
        {evidence.relatedSuspectNames.length > 0 ? (
          <View style={styles.tagWrap}>
            {evidence.relatedSuspectNames.map((name) => (
              <View key={name} style={styles.tag}>
                <Text style={styles.tagText}>{name}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.detailMuted}>Doğrudan bağlantı kaydı yok.</Text>
        )}
      </DetailBlock>

      <DetailBlock icon="eye-outline" label="İNCELEME NOTLARI" delay={340}>
        {evidence.examinationNotes.length > 0 ? (
          <View style={styles.notesList}>
            {evidence.examinationNotes.map((note, index) => (
              <View key={`${evidence.id}-note-${index}`} style={styles.noteCard}>
                <View style={styles.noteIndex}>
                  <Text style={styles.noteIndexText}>
                    {String(index + 1).padStart(2, "0")}
                  </Text>
                </View>
                <Text style={styles.noteText}>{note}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.detailMuted}>
            Henüz ek inceleme notu yok. Daha fazla kanıt topla.
          </Text>
        )}
      </DetailBlock>

      <Animated.View entering={FadeIn.delay(420).duration(700)} style={styles.footerNote}>
        <Text style={styles.footerNoteText}>
          Bu delil dosyaya işlendi. Sorguda çapraz kontrol için hazır.
        </Text>
      </Animated.View>
    </ScrollView>
  );
}

export default function EvidenceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    evidenceId?: string | string[];
    caseId?: string | string[];
  }>();
  const evidenceId = Array.isArray(params.evidenceId)
    ? params.evidenceId[0]
    : params.evidenceId;
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

  /** İnceleme = keşif: Solve ekranında delil görünsün. */
  useEffect(() => {
    if (!caseData || !evidenceId) return;
    if (!caseData.evidence.some((item) => item.id === evidenceId)) return;

    let cancelled = false;
    void discoverCaseEvidence(caseData.meta.id, evidenceId).catch(() => {
      // Sessiz: inceleme UI'sı yine de açılsın; kayıt tekrarı güvenli.
      if (cancelled) return;
    });

    return () => {
      cancelled = true;
    };
  }, [caseData, evidenceId]);

  const evidence = useMemo(() => {
    if (!caseData || !evidenceId) return null;
    return findEvidenceView(caseData, evidenceId);
  }, [caseData, evidenceId]);

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
      ) : !evidenceId || !evidence ? (
        <EmptyEvidenceState onBack={() => router.back()} />
      ) : (
        <EvidenceContent caseData={caseData!} evidence={evidence} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: t.colors.void,
  },
  coverLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "30%",
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
  scroll: {
    flex: 1,
  },
  caseChip: {
    fontFamily: t.typography.label,
    fontSize: 11,
    letterSpacing: 1.6,
    color: t.colors.gold,
    marginBottom: t.spacing.sm,
  },
  screenKicker: {
    fontFamily: t.typography.labelStrong,
    fontSize: 11,
    letterSpacing: t.typeRhythm.kickerTracking,
    color: t.colors.creamMuted,
    marginBottom: t.spacing.lg,
  },
  heroCard: {
    minHeight: 220,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.line,
    overflow: "hidden",
    justifyContent: "flex-end",
    marginBottom: t.spacing.xl,
  },
  heroVisualBreath: {
    minHeight: 88,
  },
  heroTextBlock: {
    padding: t.spacing.lg,
    paddingTop: t.spacing.sm,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.sm,
    marginBottom: t.spacing.md,
  },
  catalogPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: t.colors.goldDim,
    backgroundColor: t.colors.goldFaint,
  },
  catalogText: {
    fontFamily: t.typography.label,
    fontSize: 11,
    letterSpacing: 1.5,
    color: t.colors.goldSoft,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(243, 237, 224, 0.18)",
    backgroundColor: "rgba(5, 7, 13, 0.45)",
  },
  categoryText: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 1.2,
    color: t.colors.creamMuted,
  },
  heroTitle: {
    fontFamily: t.typography.hero,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: t.typeRhythm.heroTracking,
    color: t.colors.cream,
    marginBottom: t.spacing.sm,
  },
  heroHint: {
    fontFamily: t.typography.displayItalic,
    fontSize: 14,
    color: t.colors.creamMuted,
  },
  detailBlock: {
    marginBottom: t.spacing.lg,
    padding: t.spacing.md,
    borderRadius: t.radius.md,
    borderWidth: 1,
    borderColor: t.colors.line,
    backgroundColor: "rgba(18, 28, 51, 0.72)",
  },
  detailLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: t.spacing.sm,
  },
  detailLabel: {
    fontFamily: t.typography.labelStrong,
    fontSize: 10,
    letterSpacing: t.typeRhythm.kickerTracking,
    color: t.colors.gold,
  },
  detailBody: {
    fontFamily: t.typography.body,
    fontSize: 15,
    lineHeight: 24,
    color: t.colors.cream,
  },
  detailMuted: {
    fontFamily: t.typography.body,
    fontSize: 14,
    lineHeight: 22,
    color: t.colors.mist,
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: t.spacing.sm,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: t.colors.goldDim,
    backgroundColor: t.colors.goldFaint,
  },
  tagText: {
    fontFamily: t.typography.bodyMedium,
    fontSize: 13,
    color: t.colors.goldSoft,
  },
  notesList: {
    gap: t.spacing.sm,
  },
  noteCard: {
    flexDirection: "row",
    gap: t.spacing.sm,
    padding: t.spacing.sm + 2,
    borderRadius: t.radius.sm,
    backgroundColor: "rgba(5, 7, 13, 0.45)",
    borderWidth: 1,
    borderColor: "rgba(201, 162, 39, 0.16)",
  },
  noteIndex: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: t.colors.goldDim,
    backgroundColor: t.colors.goldFaint,
  },
  noteIndexText: {
    fontFamily: t.typography.label,
    fontSize: 10,
    color: t.colors.goldSoft,
  },
  noteText: {
    flex: 1,
    fontFamily: t.typography.body,
    fontSize: 14,
    lineHeight: 22,
    color: t.colors.cream,
  },
  footerNote: {
    marginTop: t.spacing.md,
    alignItems: "center",
  },
  footerNoteText: {
    fontFamily: t.typography.displayItalic,
    fontSize: 14,
    color: t.colors.mist,
    textAlign: "center",
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
