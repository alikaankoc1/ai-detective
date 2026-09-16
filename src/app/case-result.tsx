import { useEffect, useMemo, useState } from "react";
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
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { fetchCase } from "@/services/cases";
import {
  buildCaseResultXpAwardKey,
  claimCaseResultXp,
  markCaseSolved,
} from "@/store/playerProgress";
import { detectiveTheme as t } from "@/constants/theme";
import { getCaseCover } from "@/constants/images";
import { resolveCaseId } from "@/utils/caseRoute";
import { xpRewardForSolveResult } from "@/utils/progression";
import type { PlayerSafeCase } from "@/types/case";
import type { SolveResultKind } from "@/types/solve";

type ResultTone = "perfect" | "solved" | "failed";

type ResultPresentation = {
  tone: ResultTone;
  badge: string;
  title: string;
  description: string;
  closingNote: string;
  icon: keyof typeof Ionicons.glyphMap;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseResultKind(raw: string | undefined): SolveResultKind {
  const value = (raw ?? "correct").toLowerCase();
  if (value === "perfect" || value === "mukemmel") return "perfect";
  if (value === "wrong" || value === "failed" || value === "yanlis") return "wrong";
  if (value === "solved" || value === "correct" || value === "dogru") return "correct";
  return "correct";
}

function parsePositiveInt(
  raw: string | undefined,
  fallback: number
): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function presentationFor(kind: SolveResultKind): ResultPresentation {
  switch (kind) {
    case "perfect":
      return {
        tone: "perfect",
        badge: "PERFECT",
        title: "Kusursuz çözüm",
        description:
          "Suçlama, motif ve delil zinciri birleşti. Dosya mühürlendi.",
        closingNote:
          "Gece vardiyası sessizliğe gömüldü. Her iz doğru yerdeydi; soruşturma arşive alındı.",
        icon: "diamond",
      };
    case "correct":
      return {
        tone: "solved",
        badge: "SOLVED",
        title: "Vaka çözüldü",
        description:
          "Doğru suçlama kabul edildi. Bazı detaylar eksik kalmış olabilir.",
        closingNote:
          "Dosya kapandı. Motif ve şüpheli tutuyor; bir sonraki vardiyada daha keskin bir delil zinciri kurulabilir.",
        icon: "shield-checkmark",
      };
    case "wrong":
      return {
        tone: "failed",
        badge: "FAILED",
        title: "Dosya kapanmadı",
        description:
          "Suçlama yetersiz kaldı. İzler yeniden incelenmeli.",
        closingNote:
          "Yağmur hâlâ camlara vuruyor. Yanlış yön, boşa giden bir gece — ama dosya henüz kapanmış değil.",
        icon: "close-circle",
      };
  }
}

function toneColors(tone: ResultTone) {
  if (tone === "failed") {
    return {
      accent: "#C47878",
      badgeBg: "rgba(196, 120, 120, 0.92)",
      badgeText: t.colors.void,
      wash: [
        "rgba(139, 58, 58, 0.18)",
        "rgba(5, 7, 13, 0.12)",
        "rgba(5, 7, 13, 0.72)",
        "rgba(5, 7, 13, 0.94)",
      ] as const,
      washLocations: [0, 0.3, 0.65, 1] as const,
      glow: "rgba(139, 58, 58, 0.35)",
    };
  }
  if (tone === "perfect") {
    return {
      accent: t.colors.goldSoft,
      badgeBg: t.colors.goldSoft,
      badgeText: t.colors.void,
      wash: [
        "rgba(201, 162, 39, 0.18)",
        "rgba(5, 7, 13, 0.1)",
        "rgba(5, 7, 13, 0.68)",
        "rgba(5, 7, 13, 0.94)",
      ] as const,
      washLocations: [0, 0.3, 0.65, 1] as const,
      glow: "rgba(201, 162, 39, 0.4)",
    };
  }
  return {
    accent: t.colors.gold,
    badgeBg: t.colors.gold,
    badgeText: t.colors.void,
    wash: [
      "rgba(201, 162, 39, 0.12)",
      "rgba(5, 7, 13, 0.1)",
      "rgba(5, 7, 13, 0.68)",
      "rgba(5, 7, 13, 0.94)",
    ] as const,
    washLocations: [0, 0.3, 0.65, 1] as const,
    glow: "rgba(201, 162, 39, 0.28)",
  };
}

export default function CaseResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const params = useLocalSearchParams<{
    result?: string | string[];
    score?: string | string[];
    evidence?: string | string[];
    contradictions?: string | string[];
    caseId?: string | string[];
  }>();

  const [caseData, setCaseData] = useState<PlayerSafeCase | null>(null);
  const [loadingCase, setLoadingCase] = useState(true);

  const kind = parseResultKind(firstParam(params.result));
  const copy = presentationFor(kind);
  const colors = toneColors(copy.tone);

  const score = parsePositiveInt(
    firstParam(params.score),
    kind === "perfect" ? 100 : kind === "correct" ? 75 : 20
  );
  const xpEarned = useMemo(() => xpRewardForSolveResult(kind), [kind]);
  const evidenceCount = parsePositiveInt(firstParam(params.evidence), 3);
  const contradictionCount = parsePositiveInt(
    firstParam(params.contradictions),
    kind === "wrong" ? 0 : 2
  );
  const caseIdParam = firstParam(params.caseId);
  const resolvedCaseId = resolveCaseId(params.caseId);

  useEffect(() => {
    let cancelled = false;
    setLoadingCase(true);
    fetchCase(resolvedCaseId)
      .then((data) => {
        if (!cancelled) setCaseData(data);
      })
      .catch(() => {
        if (!cancelled) setCaseData(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingCase(false);
      });
    return () => {
      cancelled = true;
    };
  }, [resolvedCaseId]);

  useEffect(() => {
    const caseKey = caseIdParam ?? caseData?.meta.id ?? resolvedCaseId;
    const awardKey = buildCaseResultXpAwardKey(caseKey, kind, score);
    claimCaseResultXp(awardKey, xpEarned);

    if (kind === "perfect" || kind === "correct") {
      markCaseSolved(caseKey);
    }
  }, [caseIdParam, caseData?.meta.id, kind, score, xpEarned, resolvedCaseId]);

  const horizontal = Math.max(t.spacing.lg, width * 0.05);
  const heroHeight = Math.min(Math.max(height * 0.34, 240), 320);

  const caseTitle = useMemo(
    () => caseData?.meta.title ?? "Vaka Dosyası",
    [caseData]
  );
  const caseId = useMemo(
    () => caseIdParam ?? caseData?.meta.id ?? resolvedCaseId,
    [caseIdParam, caseData, resolvedCaseId]
  );

  if (loadingCase) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient
          colors={[t.colors.void, t.colors.navyDeep, t.colors.ink]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.stateCenter}>
          <ActivityIndicator color={t.colors.gold} size="large" />
          <Text style={styles.stateHint}>Dosya kapatılıyor…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={[t.colors.void, t.colors.navyDeep, "#02040A"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingBottom: insets.bottom + t.spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { height: heroHeight }]}>
          <Image
            source={getCaseCover(caseId)}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={450}
          />
          <LinearGradient
            colors={[...colors.wash]}
            locations={[...colors.washLocations]}
            style={StyleSheet.absoluteFill}
          />

          <View
            style={[
              styles.heroTop,
              {
                paddingTop: insets.top + t.spacing.md,
                paddingHorizontal: horizontal,
              },
            ]}
          >
            <Animated.View entering={FadeIn.duration(600)}>
              <Text style={styles.caseClosed}>CASE CLOSED</Text>
              <Text style={styles.caseIdLabel}>{caseId.toUpperCase()}</Text>
            </Animated.View>
          </View>

          <Animated.View
            entering={ZoomIn.delay(120).duration(520)}
            style={[styles.badgeWrap, { paddingHorizontal: horizontal }]}
          >
            <View
              style={[
                styles.resultBadge,
                { backgroundColor: colors.badgeBg, shadowColor: colors.glow },
              ]}
            >
              <Ionicons name={copy.icon} size={16} color={colors.badgeText} />
              <Text style={[styles.resultBadgeText, { color: colors.badgeText }]}>
                {copy.badge}
              </Text>
            </View>
          </Animated.View>
        </View>

        <View style={{ paddingHorizontal: horizontal, marginTop: -28 }}>
          <Animated.View entering={FadeInDown.delay(180).duration(700)}>
            <Text style={[styles.resultTitle, { color: colors.accent }]}>
              {copy.title}
            </Text>
            <Text style={styles.resultDescription}>{copy.description}</Text>
            <Text style={styles.caseTitle}>{caseTitle}</Text>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(280).duration(650)}
            style={[styles.xpPanel, t.shadow.deep]}
          >
            <LinearGradient
              colors={[
                "rgba(201, 162, 39, 0.2)",
                "rgba(18, 28, 51, 0.96)",
                "rgba(8, 14, 28, 0.98)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.xpIconSeal}>
              <Ionicons name="flash" size={22} color={t.colors.void} />
            </View>
            <View style={styles.xpBody}>
              <Text style={styles.xpLabel}>KAZANILAN XP</Text>
              <Text style={styles.xpValue}>+{xpEarned}</Text>
            </View>
            <View style={styles.scoreSeal}>
              <Text style={styles.scoreLabel}>SKOR</Text>
              <Text style={styles.scoreValue}>{score}</Text>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(360).duration(650)}
            style={styles.statsRow}
          >
            <View style={styles.statTile}>
              <LinearGradient
                colors={["rgba(26, 39, 68, 0.98)", "rgba(8, 14, 28, 0.98)"]}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="document-text" size={18} color={t.colors.gold} />
              <Text style={styles.statValue}>{evidenceCount}</Text>
              <Text style={styles.statLabel}>BULUNAN DELİL</Text>
            </View>
            <View style={styles.statTile}>
              <LinearGradient
                colors={["rgba(26, 39, 68, 0.98)", "rgba(8, 14, 28, 0.98)"]}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="alert-circle" size={18} color={t.colors.gold} />
              <Text style={styles.statValue}>{contradictionCount}</Text>
              <Text style={styles.statLabel}>YAKALANAN ÇELİŞKİ</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(440).duration(700)}>
            <Text style={styles.sectionKicker}>DOSYA ÖZETİ</Text>
            <View style={styles.summaryPanel}>
              <LinearGradient
                colors={["rgba(18, 28, 51, 0.95)", "rgba(8, 14, 28, 0.98)"]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.summaryAccent} />
              <View style={styles.summaryBody}>
                <Text style={styles.summaryTitle}>Kısa çözüm notu</Text>
                <Text style={styles.summaryText}>{copy.closingNote}</Text>
                {caseData?.meta.summary ? (
                  <Text style={styles.summaryCase}>{caseData.meta.summary}</Text>
                ) : null}
              </View>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(520).duration(650)}
            style={styles.ctaBlock}
          >
            <Pressable
              onPress={() => router.replace("/")}
              style={({ pressed }) => [
                styles.primaryCta,
                pressed && styles.pressed,
              ]}
            >
              <LinearGradient
                colors={[t.colors.goldSoft, t.colors.gold, "#A8841A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="home" size={18} color={t.colors.void} />
              <Text style={styles.primaryCtaText}>ANA SAYFAYA DÖN</Text>
            </Pressable>

            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/case-investigation",
                  params: { caseId },
                })
              }
              style={({ pressed }) => [
                styles.secondaryCta,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.secondaryCtaText}>VAKAYI TEKRAR İNCELE</Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={t.colors.goldSoft}
              />
            </Pressable>
          </Animated.View>

          <Animated.View
            entering={FadeIn.delay(640).duration(600)}
            style={styles.footerSeal}
          >
            <View style={styles.footerLine} />
            <Text style={styles.footerText}>AI DETECTIVE · ARCHIVE</Text>
            <View style={styles.footerLine} />
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: t.colors.void,
  },
  scroll: {
    flex: 1,
  },
  stateCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: t.spacing.md,
  },
  stateHint: {
    fontFamily: t.typography.body,
    color: t.colors.creamMuted,
    fontSize: 14,
  },
  hero: {
    width: "100%",
    justifyContent: "space-between",
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  caseClosed: {
    fontFamily: t.typography.labelStrong,
    fontSize: 13,
    letterSpacing: 5,
    color: t.colors.goldSoft,
  },
  caseIdLabel: {
    marginTop: 6,
    fontFamily: t.typography.bodyMedium,
    fontSize: 11,
    letterSpacing: 1.6,
    color: t.colors.mist,
  },
  badgeWrap: {
    paddingBottom: 48,
  },
  resultBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  resultBadgeText: {
    fontFamily: t.typography.labelStrong,
    fontSize: 12,
    letterSpacing: t.typeRhythm.kickerTracking,
  },
  resultTitle: {
    fontFamily: t.typography.hero,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: t.typeRhythm.heroTracking,
    marginBottom: 10,
  },
  resultDescription: {
    fontFamily: t.typography.body,
    fontSize: 15,
    lineHeight: 23,
    color: t.colors.creamMuted,
    maxWidth: 340,
    marginBottom: 8,
  },
  caseTitle: {
    fontFamily: t.typography.displayItalic,
    fontSize: 16,
    color: t.colors.gold,
    marginBottom: t.spacing.lg,
  },
  xpPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.md,
    borderRadius: t.radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: t.colors.line,
    padding: t.spacing.md,
    marginBottom: t.spacing.md,
  },
  xpIconSeal: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.gold,
  },
  xpBody: {
    flex: 1,
    gap: 2,
  },
  xpLabel: {
    fontFamily: t.typography.labelStrong,
    fontSize: 10,
    letterSpacing: t.typeRhythm.kickerTracking,
    color: t.colors.mist,
  },
  xpValue: {
    fontFamily: t.typography.title,
    fontSize: 34,
    color: t.colors.cream,
  },
  scoreSeal: {
    alignItems: "center",
    minWidth: 56,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: t.radius.sm,
    borderWidth: 1,
    borderColor: t.colors.goldDim,
    backgroundColor: t.colors.goldFaint,
  },
  scoreLabel: {
    fontFamily: t.typography.label,
    fontSize: 9,
    letterSpacing: 1.4,
    color: t.colors.mist,
  },
  scoreValue: {
    fontFamily: t.typography.display,
    fontSize: 22,
    color: t.colors.goldSoft,
  },
  statsRow: {
    flexDirection: "row",
    gap: t.spacing.sm,
    marginBottom: t.spacing.lg,
  },
  statTile: {
    flex: 1,
    minHeight: 118,
    borderRadius: t.radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: t.colors.line,
    padding: t.spacing.md,
    justifyContent: "flex-end",
    gap: 4,
  },
  statValue: {
    fontFamily: t.typography.title,
    fontSize: 32,
    color: t.colors.cream,
    marginTop: 8,
  },
  statLabel: {
    fontFamily: t.typography.labelStrong,
    fontSize: 10,
    letterSpacing: t.typeRhythm.kickerTracking,
    color: t.colors.mist,
  },
  sectionKicker: {
    fontFamily: t.typography.labelStrong,
    fontSize: 10,
    letterSpacing: t.typeRhythm.kickerTracking,
    color: t.colors.gold,
    marginBottom: t.spacing.sm,
  },
  summaryPanel: {
    borderRadius: t.radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: t.colors.line,
    flexDirection: "row",
    marginBottom: t.spacing.xl,
  },
  summaryAccent: {
    width: 4,
    backgroundColor: t.colors.gold,
  },
  summaryBody: {
    flex: 1,
    padding: t.spacing.md,
    gap: 8,
  },
  summaryTitle: {
    fontFamily: t.typography.title,
    fontSize: 20,
    letterSpacing: t.typeRhythm.titleTracking,
    color: t.colors.cream,
  },
  summaryText: {
    fontFamily: t.typography.story,
    fontSize: 14,
    lineHeight: 22,
    color: t.colors.creamMuted,
  },
  summaryCase: {
    marginTop: 4,
    fontFamily: t.typography.story,
    fontSize: 12,
    lineHeight: 19,
    color: t.colors.mist,
  },
  ctaBlock: {
    gap: t.spacing.sm,
  },
  primaryCta: {
    height: 56,
    borderRadius: t.radius.md,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(201, 162, 39, 0.55)",
    ...t.shadow.glow,
  },
  primaryCtaText: {
    fontFamily: t.typography.labelStrong,
    fontSize: 14,
    letterSpacing: t.typeRhythm.kickerTracking,
    color: t.colors.void,
  },
  secondaryCta: {
    height: 52,
    borderRadius: t.radius.md,
    borderWidth: 1,
    borderColor: t.colors.line,
    backgroundColor: "rgba(18, 28, 51, 0.75)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryCtaText: {
    fontFamily: t.typography.labelStrong,
    fontSize: 12,
    letterSpacing: t.typeRhythm.kickerTracking,
    color: t.colors.goldSoft,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  footerSeal: {
    marginTop: t.spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.sm,
  },
  footerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: t.colors.line,
  },
  footerText: {
    fontFamily: t.typography.labelStrong,
    fontSize: 9,
    letterSpacing: t.typeRhythm.kickerTracking,
    color: t.colors.mist,
  },
});
