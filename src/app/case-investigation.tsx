import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { fetchCase001 } from "@/services/cases";
import { detectiveTheme as t } from "@/constants/theme";
import { getCaseCover } from "@/constants/images";
import type { Case, Evidence, Suspect } from "@/types/case";

function SectionHeader({
  index,
  title,
  count,
}: {
  index: string;
  title: string;
  count?: number;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIndexWrap}>
        <Text style={styles.sectionIndex}>{index}</Text>
      </View>
      <View style={styles.sectionTitleWrap}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {typeof count === "number" ? (
          <Text style={styles.sectionCount}>{count} kayıt</Text>
        ) : null}
      </View>
    </View>
  );
}

function SuspectCard({
  suspect,
  order,
  delay,
  onPress,
}: {
  suspect: Suspect;
  order: number;
  delay: number;
  onPress: () => void;
}) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(650)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.suspectCard,
          pressed && styles.suspectCardPressed,
        ]}
      >
        <LinearGradient
          colors={["rgba(26, 39, 68, 0.98)", "rgba(8, 14, 28, 0.96)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.suspectTop}>
          <View style={styles.suspectAvatar}>
            <Text style={styles.suspectAvatarText}>
              {suspect.name
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")}
            </Text>
          </View>
          <View style={styles.suspectIdentity}>
            <Text style={styles.suspectOrder}>
              ŞÜPHELİ {order.toString().padStart(2, "0")}
            </Text>
            <Text style={styles.suspectName}>{suspect.name}</Text>
            <Text style={styles.suspectJob}>
              {suspect.occupation}
              {suspect.age ? ` · ${suspect.age}` : ""}
            </Text>
          </View>
        </View>

        <Text style={styles.suspectBio} numberOfLines={3}>
          {suspect.biography}
        </Text>

        <View style={styles.suspectMetaBlock}>
          <Text style={styles.metaLabel}>KURBANLA BAĞ</Text>
          <Text style={styles.metaValue}>{suspect.relationshipToVictim}</Text>
        </View>

        <View style={styles.alibiBlock}>
          <Text style={styles.metaLabel}>İDDİA EDİLEN MAZERET</Text>
          <Text style={styles.alibiText}>“{suspect.claimedAlibi}”</Text>
        </View>

        <View style={styles.interrogateCue}>
          <Text style={styles.interrogateCueText}>SORGUYA AL ›</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function EvidenceCard({
  evidence,
  order,
  delay,
  onPress,
}: {
  evidence: Evidence;
  order: number;
  delay: number;
  onPress: () => void;
}) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(650)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.evidenceCard,
          pressed && styles.evidenceCardPressed,
        ]}
      >
        <View style={styles.evidenceRail} />
        <View style={styles.evidenceBody}>
          <View style={styles.evidenceTopRow}>
            <Text style={styles.evidenceIndex}>
              D{order.toString().padStart(2, "0")}
            </Text>
            <Text style={styles.evidencePlace}>{evidence.discoveryLocation}</Text>
          </View>
          <Text style={styles.evidenceName}>{evidence.name}</Text>
          <Text style={styles.evidenceDescription} numberOfLines={3}>
            {evidence.description}
          </Text>
          <View style={styles.examineCue}>
            <Text style={styles.examineCueText}>İNCELE ›</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function LoadingState() {
  return (
    <View style={styles.stateCenter}>
      <ActivityIndicator color={t.colors.gold} size="large" />
      <Text style={styles.stateHint}>Soruşturma dosyası yükleniyor…</Text>
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

function InvestigationContent({
  data,
  onInterrogate,
  onExamineEvidence,
  onSolve,
}: {
  data: Case;
  onInterrogate: (suspectId: string) => void;
  onExamineEvidence: (evidenceId: string) => void;
  onSolve: () => void;
}) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const horizontal = Math.max(t.spacing.lg, width * 0.05);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: insets.top + t.spacing.xl,
          paddingBottom: insets.bottom + t.spacing.xxl,
          paddingHorizontal: horizontal,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeIn.duration(600)}>
        <View style={styles.topBar}>
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>AKTİF SORUŞTURMA</Text>
          </View>
          <Text style={styles.caseId}>{data.meta.id.toUpperCase()}</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(700)}>
        <Text style={styles.screenKicker}>VAKA İNCELEME</Text>
        <Text style={styles.screenTitle}>{data.meta.title}</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(160).duration(700)}>
        <SectionHeader index="01" title="Vaka Özeti" />
        <View style={styles.summaryCard}>
          <Image
            source={getCaseCover(data.meta.id)}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={400}
          />
          <LinearGradient
            colors={[...t.media.cardWash]}
            locations={[...t.media.cardLocations]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.summaryVisualBreath} />
          <View style={styles.summaryTextBlock}>
            <Text style={styles.summaryLead}>{data.meta.summary}</Text>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryFacts}>
              <View style={styles.factItem}>
                <Text style={styles.factLabel}>MEKÂN</Text>
                <Text style={styles.factValue}>{data.scene.name}</Text>
              </View>
              <View style={styles.factItem}>
                <Text style={styles.factLabel}>ZAMAN</Text>
                <Text style={styles.factValue}>
                  {data.time.dateLabel}
                  {"\n"}
                  {data.time.timeOfCrime}
                </Text>
              </View>
            </View>
            {data.time.atmosphere ? (
              <Text style={styles.atmosphere}>{data.time.atmosphere}</Text>
            ) : null}
          </View>
        </View>
      </Animated.View>

      <View style={styles.sectionGap}>
        <SectionHeader
          index="02"
          title="Şüpheliler"
          count={data.suspects.length}
        />
        <View style={styles.listGap}>
          {data.suspects.map((suspect, index) => (
            <SuspectCard
              key={suspect.id}
              suspect={suspect}
              order={index + 1}
              delay={220 + index * 90}
              onPress={() => onInterrogate(suspect.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.sectionGap}>
        <SectionHeader
          index="03"
          title="Deliller"
          count={data.evidence.length}
        />
        <View style={styles.listGap}>
          {data.evidence.map((item, index) => (
            <EvidenceCard
              key={item.id}
              evidence={item}
              order={index + 1}
              delay={280 + index * 80}
              onPress={() => onExamineEvidence(item.id)}
            />
          ))}
        </View>
      </View>

      <Animated.View
        entering={FadeInUp.delay(520).duration(700)}
        style={styles.solveSection}
      >
        <SectionHeader index="04" title="Suçlama" />
        <View style={styles.solvePanel}>
          <LinearGradient
            colors={[
              "rgba(201, 162, 39, 0.18)",
              "rgba(18, 28, 51, 0.96)",
              "rgba(8, 14, 28, 0.98)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.solveKicker}>DOSYAYI KAPAT</Text>
          <Text style={styles.solveTitle}>Hazır mısın?</Text>
          <Text style={styles.solveBody}>
            Delilleri ve ifadeleri topladıysan suçlamayı kilitle. Yanlış
            yön, dosyayı açık bırakır.
          </Text>
          <Pressable
            onPress={onSolve}
            style={({ pressed }) => [
              styles.solveCta,
              pressed && styles.solveCtaPressed,
            ]}
          >
            <LinearGradient
              colors={[t.colors.goldSoft, t.colors.gold, "#A8841A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="flash" size={18} color={t.colors.void} />
            <Text style={styles.solveCtaText}>VAKAYI ÇÖZ</Text>
          </Pressable>
        </View>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(700).duration(800)} style={styles.endNote}>
        <Text style={styles.endNoteText}>
          Sorgulama henüz başlamadı. Delilleri çapraz oku.
        </Text>
      </Animated.View>
    </ScrollView>
  );
}

export default function CaseInvestigationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setCaseData(null);

    fetchCase001()
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
  }, [reloadKey]);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      <LinearGradient
        colors={[t.colors.navy, t.colors.navyDeep, t.colors.void]}
        locations={[0, 0.4, 1]}
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
        colors={["rgba(201, 162, 39, 0.06)", "transparent"]}
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
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      ) : caseData ? (
        <InvestigationContent
          data={caseData}
          onInterrogate={(suspectId) =>
            router.push({
              pathname: "/interrogation",
              params: { suspectId },
            })
          }
          onExamineEvidence={(evidenceId) =>
            router.push({
              pathname: "/evidence",
              params: { evidenceId },
            })
          }
          onSolve={() => router.push("/case-solve")}
        />
      ) : null}
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
    height: "34%",
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: t.spacing.lg,
    marginLeft: 44,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(201, 162, 39, 0.4)",
    backgroundColor: "rgba(201, 162, 39, 0.1)",
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: t.colors.gold,
  },
  liveText: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 1.8,
    color: t.colors.goldSoft,
  },
  caseId: {
    fontFamily: t.typography.label,
    fontSize: 11,
    letterSpacing: 1.5,
    color: t.colors.mist,
  },
  screenKicker: {
    fontFamily: t.typography.labelStrong,
    fontSize: 11,
    letterSpacing: t.typeRhythm.kickerTracking,
    color: t.colors.gold,
    marginBottom: t.spacing.sm,
  },
  screenTitle: {
    fontFamily: t.typography.hero,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: t.typeRhythm.heroTracking,
    color: t.colors.cream,
    marginBottom: t.spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.md,
    marginBottom: t.spacing.md,
  },
  sectionIndexWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: t.colors.goldDim,
    backgroundColor: t.colors.goldFaint,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionIndex: {
    fontFamily: t.typography.label,
    fontSize: 12,
    color: t.colors.goldSoft,
  },
  sectionTitleWrap: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: t.typography.display,
    fontSize: 22,
    color: t.colors.cream,
  },
  sectionCount: {
    fontFamily: t.typography.body,
    fontSize: 12,
    color: t.colors.mist,
    marginTop: 2,
  },
  sectionGap: {
    marginTop: t.spacing.xl,
  },
  listGap: {
    gap: t.spacing.md,
  },
  summaryCard: {
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.line,
    overflow: "hidden",
    minHeight: 280,
    justifyContent: "flex-end",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  summaryVisualBreath: {
    minHeight: 120,
  },
  summaryTextBlock: {
    padding: t.spacing.lg,
    paddingTop: t.spacing.md,
  },
  summaryLead: {
    fontFamily: t.typography.displayItalic,
    fontSize: 17,
    lineHeight: 27,
    color: t.colors.cream,
  },
  summaryDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: t.colors.goldDim,
    marginVertical: t.spacing.md,
  },
  summaryFacts: {
    flexDirection: "row",
    gap: t.spacing.md,
  },
  factItem: {
    flex: 1,
  },
  factLabel: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 1.8,
    color: t.colors.gold,
    marginBottom: 6,
  },
  factValue: {
    fontFamily: t.typography.bodyMedium,
    fontSize: 13,
    lineHeight: 19,
    color: t.colors.creamMuted,
  },
  atmosphere: {
    marginTop: t.spacing.md,
    fontFamily: t.typography.body,
    fontSize: 13,
    lineHeight: 20,
    color: t.colors.mist,
  },
  suspectCard: {
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.line,
    padding: t.spacing.lg,
    overflow: "hidden",
  },
  suspectCardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  interrogateCue: {
    marginTop: t.spacing.md,
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: t.colors.goldDim,
    backgroundColor: t.colors.goldFaint,
  },
  interrogateCueText: {
    fontFamily: t.typography.label,
    fontSize: 11,
    letterSpacing: 1.8,
    color: t.colors.goldSoft,
  },
  suspectTop: {
    flexDirection: "row",
    gap: t.spacing.md,
    marginBottom: t.spacing.md,
  },
  suspectAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: t.colors.gold,
    backgroundColor: "rgba(201, 162, 39, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  suspectAvatarText: {
    fontFamily: t.typography.label,
    fontSize: 14,
    letterSpacing: 1,
    color: t.colors.goldSoft,
  },
  suspectIdentity: {
    flex: 1,
    justifyContent: "center",
  },
  suspectOrder: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 2,
    color: t.colors.gold,
    marginBottom: 4,
  },
  suspectName: {
    fontFamily: t.typography.display,
    fontSize: 22,
    color: t.colors.cream,
  },
  suspectJob: {
    fontFamily: t.typography.bodyMedium,
    fontSize: 13,
    color: t.colors.creamMuted,
    marginTop: 2,
  },
  suspectBio: {
    fontFamily: t.typography.body,
    fontSize: 14,
    lineHeight: 22,
    color: t.colors.creamMuted,
    marginBottom: t.spacing.md,
  },
  suspectMetaBlock: {
    marginBottom: t.spacing.sm,
  },
  metaLabel: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 1.8,
    color: t.colors.gold,
    marginBottom: 6,
  },
  metaValue: {
    fontFamily: t.typography.bodyMedium,
    fontSize: 14,
    lineHeight: 21,
    color: t.colors.cream,
  },
  alibiBlock: {
    marginTop: t.spacing.sm,
    padding: t.spacing.md,
    borderRadius: t.radius.md,
    backgroundColor: "rgba(5, 7, 13, 0.45)",
    borderWidth: 1,
    borderColor: "rgba(201, 162, 39, 0.18)",
  },
  alibiText: {
    fontFamily: t.typography.displayItalic,
    fontSize: 15,
    lineHeight: 24,
    color: t.colors.cream,
  },
  evidenceCard: {
    flexDirection: "row",
    borderRadius: t.radius.md,
    borderWidth: 1,
    borderColor: t.colors.line,
    backgroundColor: "rgba(18, 28, 51, 0.72)",
    overflow: "hidden",
  },
  evidenceCardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  evidenceRail: {
    width: 4,
    backgroundColor: t.colors.gold,
  },
  evidenceBody: {
    flex: 1,
    padding: t.spacing.md,
  },
  evidenceTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    gap: t.spacing.sm,
  },
  evidenceIndex: {
    fontFamily: t.typography.label,
    fontSize: 11,
    letterSpacing: 1.5,
    color: t.colors.goldSoft,
  },
  evidencePlace: {
    flex: 1,
    textAlign: "right",
    fontFamily: t.typography.body,
    fontSize: 11,
    color: t.colors.mist,
  },
  evidenceName: {
    fontFamily: t.typography.display,
    fontSize: 18,
    color: t.colors.cream,
    marginBottom: 6,
  },
  evidenceDescription: {
    fontFamily: t.typography.body,
    fontSize: 14,
    lineHeight: 22,
    color: t.colors.creamMuted,
  },
  examineCue: {
    marginTop: t.spacing.sm,
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: t.colors.goldDim,
    backgroundColor: t.colors.goldFaint,
  },
  examineCueText: {
    fontFamily: t.typography.label,
    fontSize: 11,
    letterSpacing: 1.8,
    color: t.colors.goldSoft,
  },
  solveSection: {
    marginTop: t.spacing.xl,
    gap: t.spacing.md,
  },
  solvePanel: {
    borderRadius: t.radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: t.colors.line,
    padding: t.spacing.lg,
    gap: 8,
  },
  solveKicker: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 2,
    color: t.colors.gold,
  },
  solveTitle: {
    fontFamily: t.typography.title,
    fontSize: 28,
    color: t.colors.cream,
  },
  solveBody: {
    fontFamily: t.typography.body,
    fontSize: 14,
    lineHeight: 21,
    color: t.colors.creamMuted,
    marginBottom: t.spacing.sm,
  },
  solveCta: {
    height: 54,
    borderRadius: t.radius.md,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(201, 162, 39, 0.55)",
  },
  solveCtaPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  solveCtaText: {
    fontFamily: t.typography.label,
    fontSize: 14,
    letterSpacing: 2,
    color: t.colors.void,
  },
  endNote: {
    marginTop: t.spacing.xxl,
    alignItems: "center",
  },
  endNoteText: {
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
    fontFamily: t.typography.title,
    fontSize: 28,
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
    fontFamily: t.typography.label,
    fontSize: 13,
    letterSpacing: 1.5,
    color: t.colors.goldSoft,
  },
});
