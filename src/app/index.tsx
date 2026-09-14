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
import {
  CormorantGaramond_600SemiBold,
  CormorantGaramond_600SemiBold_Italic,
  CormorantGaramond_700Bold,
  useFonts,
} from "@expo-google-fonts/cormorant-garamond";
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
} from "@expo-google-fonts/outfit";
import { fetchCase001 } from "@/services/cases";
import { detectiveTheme as t } from "@/constants/theme";
import { fallbackCover, gameImages, getCaseCover } from "@/constants/images";
import type { Case } from "@/types/case";

/** Yakında eklenecek vakalar — kilitli kartlar. */
const upcomingCases = [
  { id: "case-002", label: "Vaka #002", title: "Kayıp Paket", difficulty: 2 },
  { id: "case-003", label: "Vaka #003", title: "Son Tren", difficulty: 3 },
];

function Stars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <View style={styles.starRow}>
      {Array.from({ length: max }).map((_, index) => (
        <Ionicons
          key={index}
          name={index < value ? "star" : "star-outline"}
          size={12}
          color={index < value ? t.colors.gold : t.colors.mist}
        />
      ))}
    </View>
  );
}

function HeroBanner({ height }: { height: number }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.hero, { height }]}>
      <Image
        source={gameImages.homeHeader}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={400}
      />
      <LinearGradient
        colors={["rgba(5, 7, 13, 0.72)", "rgba(5, 7, 13, 0.35)", t.colors.void]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.heroTop, { paddingTop: insets.top + t.spacing.md }]}>
        <View style={styles.profileRow}>
          <View style={styles.avatarRing}>
            <Image
              source={gameImages.splash}
              style={styles.avatarImage}
              contentFit="cover"
            />
          </View>
          <View>
            <Text style={styles.greeting}>Merhaba,</Text>
            <View style={styles.nameRow}>
              <Text style={styles.detectiveName}>Dedektif</Text>
              <View style={styles.levelPill}>
                <Text style={styles.levelPillText}>Lv. 1</Text>
              </View>
            </View>
          </View>
        </View>

        <Pressable style={styles.iconButton} hitSlop={10}>
          <Ionicons name="settings-outline" size={20} color={t.colors.creamMuted} />
        </Pressable>
      </View>

      <Animated.View entering={FadeIn.delay(200).duration(900)} style={styles.heroTitleWrap}>
        <Text style={styles.heroKicker}>AI DEDEKTİF</Text>
        <Text style={styles.heroTagline}>Her gün yeni bir gizem, sen çöz.</Text>
      </Animated.View>
    </View>
  );
}

function FeaturedCaseCard({
  data,
  onPlay,
}: {
  data: Case;
  onPlay: () => void;
}) {
  return (
    <Animated.View entering={FadeInUp.delay(120).duration(700)}>
      <Pressable
        onPress={onPlay}
        style={({ pressed }) => [
          styles.featuredCard,
          pressed && styles.pressedCard,
        ]}
      >
        <Image
          source={getCaseCover(data.meta.id)}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          colors={["rgba(5, 7, 13, 0.45)", "rgba(5, 7, 13, 0.88)", "rgba(3, 5, 10, 0.97)"]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.featuredBody}>
          <View style={styles.featuredEyebrowRow}>
            <Ionicons name="calendar-outline" size={13} color={t.colors.gold} />
            <Text style={styles.featuredEyebrow}>GÜNÜN VAKASI</Text>
          </View>

          <Text style={styles.featuredTitle}>{data.meta.title}</Text>
          <Text style={styles.featuredSummary} numberOfLines={3}>
            {data.meta.summary}
          </Text>

          <View style={styles.featuredFooter}>
            <View>
              <Text style={styles.difficultyLabel}>Zorluk</Text>
              <Stars value={4} />
            </View>

            <View style={styles.playButton}>
              <LinearGradient
                colors={[t.colors.goldSoft, t.colors.gold, "#A8841A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.playGradient}
              >
                <Text style={styles.playLabel}>VAKAYI OYNA</Text>
                <Ionicons name="chevron-forward" size={16} color={t.colors.void} />
              </LinearGradient>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function UpcomingCaseCard({
  label,
  title,
  difficulty,
  width,
  delay,
}: {
  label: string;
  title: string;
  difficulty: number;
  width: number;
  delay: number;
}) {
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(650)}
      style={[styles.upcomingCard, { width }]}
    >
      <View style={styles.upcomingThumb}>
        <Image
          source={fallbackCover}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={250}
        />
        <LinearGradient
          colors={["rgba(5, 7, 13, 0.2)", "rgba(5, 7, 13, 0.85)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.lockBadge}>
          <Ionicons name="lock-closed" size={12} color={t.colors.goldSoft} />
        </View>
      </View>

      <Text style={styles.upcomingLabel}>{label}</Text>
      <Text style={styles.upcomingTitle} numberOfLines={1}>
        {title}
      </Text>
      <Stars value={difficulty} />
    </Animated.View>
  );
}

function LevelPanel() {
  return (
    <Animated.View entering={FadeInUp.delay(320).duration(700)} style={styles.levelPanel}>
      <View style={styles.levelBadge}>
        <Ionicons name="ribbon-outline" size={22} color={t.colors.goldSoft} />
      </View>
      <View style={styles.levelInfo}>
        <Text style={styles.levelTitle}>Dedektif Seviyesi</Text>
        <Text style={styles.levelValue}>Lv. 1</Text>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={[t.colors.gold, t.colors.goldSoft]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: "18%" }]}
          />
        </View>
      </View>
      <Text style={styles.xpText}>90 / 500 XP</Text>
    </Animated.View>
  );
}

function LoadingState() {
  return (
    <View style={styles.stateCenter}>
      <ActivityIndicator color={t.colors.gold} size="large" />
      <Text style={styles.stateHint}>Dosyalar hazırlanıyor…</Text>
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
      <Ionicons name="cloud-offline-outline" size={40} color={t.colors.gold} />
      <Text style={styles.errorTitle}>Merkez sunucuya ulaşılamıyor</Text>
      <Text style={styles.errorBody}>{message}</Text>
      <Pressable onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryText}>Yeniden dene</Text>
      </Pressable>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    CormorantGaramond_600SemiBold,
    CormorantGaramond_600SemiBold_Italic,
    CormorantGaramond_700Bold,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
  });

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

  const horizontal = Math.max(t.spacing.lg, width * 0.05);
  const heroHeight = Math.min(Math.max(height * 0.3, 220), 320);
  const upcomingWidth = Math.min((width - horizontal * 2 - t.spacing.sm) / 2.2, 190);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      <LinearGradient
        colors={[t.colors.navyDeep, t.colors.void, "#02040A"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {!fontsLoaded || (!caseData && !error) ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />
      ) : caseData ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: insets.bottom + t.spacing.xxl }}
          showsVerticalScrollIndicator={false}
        >
          <HeroBanner height={heroHeight} />

          <View style={{ paddingHorizontal: horizontal }}>
            <FeaturedCaseCard
              data={caseData}
              onPlay={() => router.push("/case-story")}
            />

            <Animated.View
              entering={FadeInDown.delay(220).duration(600)}
              style={styles.sectionRow}
            >
              <Text style={styles.sectionTitle}>DEVAM EDİLEN VAKALAR</Text>
              <Text style={styles.sectionAction}>Tümünü Gör</Text>
            </Animated.View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.upcomingRow}
            >
              {upcomingCases.map((item, index) => (
                <UpcomingCaseCard
                  key={item.id}
                  label={item.label}
                  title={item.title}
                  difficulty={item.difficulty}
                  width={upcomingWidth}
                  delay={260 + index * 80}
                />
              ))}
            </ScrollView>

            <LevelPanel />
          </View>
        </ScrollView>
      ) : null}
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
  hero: {
    width: "100%",
    justifyContent: "space-between",
    marginBottom: t.spacing.lg,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: t.spacing.lg,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.sm + 2,
  },
  avatarRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: t.colors.gold,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  greeting: {
    fontFamily: t.typography.body,
    fontSize: 12,
    color: t.colors.creamMuted,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.sm,
  },
  detectiveName: {
    fontFamily: t.typography.display,
    fontSize: 22,
    color: t.colors.cream,
  },
  levelPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: t.colors.goldDim,
    backgroundColor: t.colors.goldFaint,
  },
  levelPillText: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 0.8,
    color: t.colors.goldSoft,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(243, 237, 224, 0.16)",
    backgroundColor: "rgba(5, 7, 13, 0.45)",
  },
  heroTitleWrap: {
    paddingHorizontal: t.spacing.lg,
    paddingBottom: t.spacing.lg,
  },
  heroKicker: {
    fontFamily: t.typography.label,
    fontSize: 12,
    letterSpacing: 4,
    color: t.colors.gold,
    marginBottom: 4,
  },
  heroTagline: {
    fontFamily: t.typography.displayItalic,
    fontSize: 17,
    color: t.colors.creamMuted,
  },
  featuredCard: {
    height: 300,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.line,
    overflow: "hidden",
    justifyContent: "flex-end",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  pressedCard: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  featuredBody: {
    padding: t.spacing.lg,
  },
  featuredEyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: t.spacing.sm,
  },
  featuredEyebrow: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 2.2,
    color: t.colors.gold,
  },
  featuredTitle: {
    fontFamily: t.typography.title,
    fontSize: 30,
    lineHeight: 36,
    color: t.colors.cream,
    marginBottom: t.spacing.sm,
  },
  featuredSummary: {
    fontFamily: t.typography.body,
    fontSize: 13,
    lineHeight: 20,
    color: t.colors.creamMuted,
    marginBottom: t.spacing.md,
  },
  featuredFooter: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: t.spacing.md,
  },
  difficultyLabel: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 1.6,
    color: t.colors.mist,
    marginBottom: 6,
  },
  starRow: {
    flexDirection: "row",
    gap: 3,
  },
  playButton: {
    borderRadius: 999,
    overflow: "hidden",
  },
  playGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: t.spacing.md,
    paddingVertical: 12,
  },
  playLabel: {
    fontFamily: t.typography.label,
    fontSize: 12,
    letterSpacing: 1.6,
    color: t.colors.void,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: t.spacing.xl,
    marginBottom: t.spacing.md,
  },
  sectionTitle: {
    fontFamily: t.typography.label,
    fontSize: 11,
    letterSpacing: 2.4,
    color: t.colors.cream,
  },
  sectionAction: {
    fontFamily: t.typography.bodyMedium,
    fontSize: 12,
    color: t.colors.gold,
  },
  upcomingRow: {
    gap: t.spacing.sm + 2,
    paddingRight: t.spacing.md,
  },
  upcomingCard: {
    gap: 6,
  },
  upcomingThumb: {
    height: 120,
    borderRadius: t.radius.md,
    borderWidth: 1,
    borderColor: t.colors.line,
    overflow: "hidden",
    marginBottom: 4,
  },
  lockBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5, 7, 13, 0.7)",
    borderWidth: 1,
    borderColor: t.colors.goldDim,
  },
  upcomingLabel: {
    fontFamily: t.typography.body,
    fontSize: 11,
    color: t.colors.mist,
  },
  upcomingTitle: {
    fontFamily: t.typography.display,
    fontSize: 16,
    color: t.colors.cream,
  },
  levelPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.md,
    marginTop: t.spacing.xl,
    padding: t.spacing.md,
    borderRadius: t.radius.md,
    borderWidth: 1,
    borderColor: t.colors.line,
    backgroundColor: "rgba(18, 28, 51, 0.6)",
  },
  levelBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: t.colors.goldDim,
    backgroundColor: t.colors.goldFaint,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontFamily: t.typography.body,
    fontSize: 12,
    color: t.colors.mist,
  },
  levelValue: {
    fontFamily: t.typography.display,
    fontSize: 18,
    color: t.colors.cream,
    marginBottom: 6,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(243, 237, 224, 0.12)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  xpText: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 0.8,
    color: t.colors.mist,
  },
  stateCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: t.spacing.xl,
    gap: t.spacing.sm,
  },
  stateHint: {
    fontFamily: t.typography.bodyMedium,
    fontSize: 14,
    color: t.colors.mist,
  },
  errorTitle: {
    fontFamily: t.typography.title,
    fontSize: 24,
    textAlign: "center",
    color: t.colors.cream,
  },
  errorBody: {
    fontFamily: t.typography.body,
    fontSize: 13,
    lineHeight: 20,
    color: t.colors.creamMuted,
    textAlign: "center",
    marginBottom: t.spacing.md,
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
