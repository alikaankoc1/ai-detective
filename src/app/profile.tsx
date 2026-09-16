import { useCallback, useEffect, useMemo, useState } from "react";
import {
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
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import {
  getPlayerProgressDetail,
  getSolvedCaseIds,
} from "@/store/playerProgress";
import {
  getLevelProgress,
  type LevelProgress,
} from "@/utils/progression";
import { detectiveTheme as t } from "@/constants/theme";
import { gameImages, getCaseCover } from "@/constants/images";

const CASE_CATALOG = [
  { id: "case-001", title: "03:17'deki Telefon", fileLabel: "CASE-001" },
  { id: "case-002", title: "Kayıp Anahtar", fileLabel: "CASE-002" },
  { id: "case-003", title: "Son Tren", fileLabel: "CASE-003" },
] as const;

const LIBRARY_TOTAL = CASE_CATALOG.length;

function detectiveTitleForLevel(level: number): string {
  if (level >= 10) return "Efsane Dedektif";
  if (level >= 7) return "Kıdemli Müfettiş";
  if (level >= 5) return "Saha Dedektifi";
  if (level >= 3) return "Gece Vardiyası Dedektifi";
  if (level >= 2) return "Stajyer Dedektif";
  return "Acemi Dedektif";
}

function XpBar({ progress }: { progress: number }) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(
      350,
      withTiming(Math.max(0.04, Math.min(progress, 1)), {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [progress, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View style={styles.xpTrack}>
      <Animated.View style={[styles.xpFillWrap, fillStyle]}>
        <LinearGradient
          colors={[t.colors.gold, t.colors.goldSoft, "#F0DF9A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const horizontal = Math.max(t.spacing.lg, width * 0.05);


  const [levelProgress, setLevelProgress] = useState<LevelProgress>(() =>
    getPlayerProgressDetail()
  );
  const [solvedIds, setSolvedIds] = useState<string[]>(() => getSolvedCaseIds());

  useFocusEffect(
    useCallback(() => {
      const detail = getPlayerProgressDetail();
      setLevelProgress(getLevelProgress(detail.totalXp));
      setSolvedIds(getSolvedCaseIds());
    }, [])
  );

  const title = useMemo(
    () => detectiveTitleForLevel(levelProgress.level),
    [levelProgress.level]
  );

  const solvedInLibrary = useMemo(
    () =>
      CASE_CATALOG.filter((item) => solvedIds.includes(item.id)).map(
        (item) => item.id
      ),
    [solvedIds]
  );

  const solvedCount = solvedInLibrary.length;
  /**
   * Outcome kırılımı store'da yok.
   * Başarılı kapanışlar = solvedCaseIds (PERFECT veya SOLVED sonucu).
   * PERFECT / FAILED ayrı tutulmadığı için SOLVED sütununda gösterilir.
   */
  const outcomeSolved = solvedCount;
  const outcomePerfect = 0;
  const outcomeFailed = 0;
  const successRate =
    LIBRARY_TOTAL > 0
      ? Math.round((solvedCount / LIBRARY_TOTAL) * 100)
      : 0;

  const barRatio = getLevelProgress(levelProgress.totalXp).progressRatio;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />

      <Image
        source={gameImages.splash}
        style={styles.bgImage}
        contentFit="cover"
        blurRadius={20}
      />
      <LinearGradient
        colors={[...t.media.bgWash]}
        locations={[...t.media.bgLocations]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingTop: insets.top + t.spacing.lg,
          paddingBottom: insets.bottom + t.spacing.xxl,
          paddingHorizontal: horizontal,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(500)}>
          <View style={styles.topRow}>
            <Pressable
              onPress={() => router.replace("/")}
              style={({ pressed }) => [
                styles.backRow,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={18}
                color={t.colors.goldSoft}
              />
              <Text style={styles.backText}>Ana Sayfa</Text>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(700)}>
          <Text style={styles.kicker}>DETECTIVE PROFILE</Text>
          <Text style={styles.title}>Dedektif Profili</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(140).duration(700)}
          style={[styles.heroCard, t.shadow.deep]}
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
          <View style={styles.heroTop}>
            <View style={styles.avatarRing}>
              <Image
                source={gameImages.splash}
                style={styles.avatarImage}
                contentFit="cover"
              />
            </View>
            <View style={styles.heroIdentity}>
              <Text style={styles.heroName}>Dedektif</Text>
              <Text style={styles.heroTitle}>{title}</Text>
              <Text style={styles.heroLevel}>
                LEVEL {levelProgress.level.toString().padStart(2, "0")}
              </Text>
            </View>
            <View style={styles.levelSeal}>
              <Text style={styles.levelSealLabel}>LV</Text>
              <Text style={styles.levelSealValue}>
                {levelProgress.level.toString().padStart(2, "0")}
              </Text>
            </View>
          </View>

          <View style={styles.xpMeta}>
            <Text style={styles.xpLabel}>TOPLAM XP</Text>
            <Text style={styles.xpTotal}>{levelProgress.totalXp}</Text>
          </View>
          <View style={styles.xpMetaRow}>
            <Text style={styles.xpBand}>
              {levelProgress.xpIntoLevel} / {levelProgress.xpForNextLevel} XP
            </Text>
            <Text style={styles.xpRemain}>
              Sonraki seviyeye {levelProgress.xpToNextLevel} XP
            </Text>
          </View>
          <XpBar progress={barRatio} />
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(240).duration(650)}
          style={styles.sectionHead}
        >
          <Text style={styles.sectionKicker}>01 · İSTATİSTİK</Text>
          <Text style={styles.sectionTitle}>Dosya özeti</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(280).duration(650)}
          style={styles.statsGrid}
        >
          <View style={styles.statTile}>
            <LinearGradient
              colors={["rgba(26, 39, 68, 0.98)", "rgba(8, 14, 28, 0.98)"]}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.statValue}>{solvedCount}</Text>
            <Text style={styles.statLabel}>ÇÖZÜLEN VAKA</Text>
          </View>
          <View style={styles.statTile}>
            <LinearGradient
              colors={["rgba(26, 39, 68, 0.98)", "rgba(8, 14, 28, 0.98)"]}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.statValue}>{successRate}%</Text>
            <Text style={styles.statLabel}>BAŞARI ORANI</Text>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(340).duration(650)}
          style={styles.outcomeRow}
        >
          <View style={styles.outcomeTile}>
            <Text style={styles.outcomeValue}>{outcomePerfect}</Text>
            <Text style={styles.outcomeLabel}>PERFECT</Text>
          </View>
          <View style={[styles.outcomeTile, styles.outcomeTileAccent]}>
            <Text style={[styles.outcomeValue, { color: t.colors.goldSoft }]}>
              {outcomeSolved}
            </Text>
            <Text style={styles.outcomeLabel}>SOLVED</Text>
          </View>
          <View style={styles.outcomeTile}>
            <Text style={styles.outcomeValue}>{outcomeFailed}</Text>
            <Text style={styles.outcomeLabel}>FAILED</Text>
          </View>
        </Animated.View>
        <Text style={styles.outcomeHint}>
          PERFECT / FAILED ayrı tutulmuyor; başarılı kapanışlar SOLVED altında.
        </Text>

        <Animated.View
          entering={FadeInUp.delay(400).duration(650)}
          style={styles.sectionHead}
        >
          <Text style={styles.sectionKicker}>02 · ARŞİV</Text>
          <Text style={styles.sectionTitle}>Çözülen vakalar</Text>
        </Animated.View>

        <View style={styles.archiveList}>
          {CASE_CATALOG.map((item, index) => {
            const solved = solvedIds.includes(item.id);
            return (
              <Animated.View
                key={item.id}
                entering={FadeInUp.delay(440 + index * 80).duration(600)}
              >
                <View
                  style={[
                    styles.archiveCard,
                    solved && styles.archiveCardSolved,
                  ]}
                >
                  <Image
                    source={getCaseCover(item.id)}
                    style={styles.archiveThumb}
                    contentFit="cover"
                  />
                  <View style={styles.archiveBody}>
                    <Text style={styles.archiveFile}>{item.fileLabel}</Text>
                    <Text style={styles.archiveTitle}>{item.title}</Text>
                    {solved ? (
                      <View style={styles.solvedBadge}>
                        <Ionicons
                          name="shield-checkmark"
                          size={12}
                          color={t.colors.void}
                        />
                        <Text style={styles.solvedBadgeText}>SOLVED</Text>
                      </View>
                    ) : (
                      <Text style={styles.archivePending}>Açık / kilitli</Text>
                    )}
                  </View>
                </View>
              </Animated.View>
            );
          })}
        </View>

        {solvedCount === 0 ? (
          <Animated.View entering={FadeIn.delay(520).duration(500)}>
            <Text style={styles.emptyArchive}>
              Henüz kapanmış dosya yok. İlk vakayı çözerek arşivi doldur.
            </Text>
          </Animated.View>
        ) : null}

        <Animated.View
          entering={FadeInUp.delay(560).duration(600)}
          style={styles.homeCtaWrap}
        >
          <Pressable
            onPress={() => router.replace("/")}
            style={({ pressed }) => [
              styles.homeCta,
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
            <Text style={styles.homeCtaText}>ANA SAYFAYA DÖN</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: t.colors.void,
  },
  bgImage: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.48,
  },
  scroll: {
    flex: 1,
  },
  topRow: {
    marginBottom: t.spacing.md,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
  },
  backText: {
    fontFamily: t.typography.label,
    color: t.colors.goldSoft,
    fontSize: 13,
    letterSpacing: 0.6,
  },
  kicker: {
    fontFamily: t.typography.labelStrong,
    fontSize: 12,
    letterSpacing: t.typeRhythm.kickerTracking + 1.5,
    color: t.colors.gold,
    marginBottom: 8,
  },
  title: {
    fontFamily: t.typography.hero,
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: t.typeRhythm.heroTracking,
    color: t.colors.cream,
    marginBottom: t.spacing.lg,
  },
  heroCard: {
    borderRadius: t.radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: t.colors.line,
    padding: t.spacing.md,
    marginBottom: t.spacing.xl,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.md,
    marginBottom: t.spacing.md,
  },
  avatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: t.colors.gold,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  heroIdentity: {
    flex: 1,
    gap: 2,
  },
  heroName: {
    fontFamily: t.typography.display,
    fontSize: 24,
    color: t.colors.cream,
  },
  heroTitle: {
    fontFamily: t.typography.bodyMedium,
    fontSize: 13,
    color: t.colors.goldSoft,
  },
  heroLevel: {
    marginTop: 2,
    fontFamily: t.typography.label,
    fontSize: 11,
    letterSpacing: 1.6,
    color: t.colors.mist,
  },
  levelSeal: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: t.colors.gold,
    backgroundColor: t.colors.goldFaint,
    alignItems: "center",
    justifyContent: "center",
  },
  levelSealLabel: {
    fontFamily: t.typography.label,
    fontSize: 9,
    letterSpacing: 1.4,
    color: t.colors.mist,
  },
  levelSealValue: {
    fontFamily: t.typography.title,
    fontSize: 20,
    color: t.colors.goldSoft,
    marginTop: -2,
  },
  xpMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 4,
  },
  xpLabel: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 1.8,
    color: t.colors.mist,
  },
  xpTotal: {
    fontFamily: t.typography.title,
    fontSize: 28,
    color: t.colors.cream,
  },
  xpMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: t.spacing.sm,
  },
  xpBand: {
    fontFamily: t.typography.bodyMedium,
    fontSize: 12,
    color: t.colors.creamMuted,
  },
  xpRemain: {
    fontFamily: t.typography.body,
    fontSize: 11,
    color: t.colors.mist,
  },
  xpTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: t.colors.smoke,
    overflow: "hidden",
  },
  xpFillWrap: {
    height: "100%",
    borderRadius: 4,
    overflow: "hidden",
  },
  sectionHead: {
    marginBottom: t.spacing.md,
  },
  sectionKicker: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 2,
    color: t.colors.gold,
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: t.typography.display,
    fontSize: 24,
    color: t.colors.cream,
  },
  statsGrid: {
    flexDirection: "row",
    gap: t.spacing.sm,
    marginBottom: t.spacing.sm,
  },
  statTile: {
    flex: 1,
    minHeight: 100,
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
  },
  statLabel: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 1.2,
    color: t.colors.mist,
  },
  outcomeRow: {
    flexDirection: "row",
    gap: t.spacing.sm,
    marginBottom: t.spacing.xs,
  },
  outcomeTile: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: t.spacing.md,
    borderRadius: t.radius.md,
    borderWidth: 1,
    borderColor: t.colors.line,
    backgroundColor: "rgba(18, 28, 51, 0.85)",
  },
  outcomeTileAccent: {
    borderColor: t.colors.goldDim,
    backgroundColor: t.colors.goldFaint,
  },
  outcomeValue: {
    fontFamily: t.typography.display,
    fontSize: 22,
    color: t.colors.cream,
  },
  outcomeLabel: {
    fontFamily: t.typography.label,
    fontSize: 9,
    letterSpacing: 1.3,
    color: t.colors.mist,
  },
  outcomeHint: {
    fontFamily: t.typography.body,
    fontSize: 11,
    lineHeight: 16,
    color: t.colors.mist,
    marginBottom: t.spacing.xl,
  },
  archiveList: {
    gap: t.spacing.sm,
  },
  archiveCard: {
    flexDirection: "row",
    gap: t.spacing.md,
    borderRadius: t.radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: t.colors.line,
    backgroundColor: "rgba(18, 28, 51, 0.9)",
    padding: t.spacing.sm,
    alignItems: "center",
  },
  archiveCardSolved: {
    borderColor: t.colors.gold,
  },
  archiveThumb: {
    width: 64,
    height: 64,
    borderRadius: t.radius.sm,
  },
  archiveBody: {
    flex: 1,
    gap: 3,
  },
  archiveFile: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 1.4,
    color: t.colors.gold,
  },
  archiveTitle: {
    fontFamily: t.typography.display,
    fontSize: 18,
    color: t.colors.cream,
  },
  archivePending: {
    fontFamily: t.typography.body,
    fontSize: 12,
    color: t.colors.mist,
  },
  solvedBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: t.colors.goldSoft,
  },
  solvedBadgeText: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 1.4,
    color: t.colors.void,
  },
  emptyArchive: {
    marginTop: t.spacing.md,
    fontFamily: t.typography.body,
    fontSize: 13,
    lineHeight: 20,
    color: t.colors.mist,
  },
  homeCtaWrap: {
    marginTop: t.spacing.xl,
  },
  homeCta: {
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
  homeCtaText: {
    fontFamily: t.typography.label,
    fontSize: 13,
    letterSpacing: 1.8,
    color: t.colors.void,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
});
