import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { BlurTargetView, BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import {
  fetchCase,
  fetchInvestigationState,
} from "@/services/cases";
import { getPlayerProgressDetail } from "@/store/playerProgress";
import { getLevelProgress, type LevelProgress } from "@/utils/progression";
import { detectiveTheme as t } from "@/constants/theme";
import { gameImages, getCaseCover } from "@/constants/images";
import { DEFAULT_CASE_ID } from "@/utils/caseRoute";
import type { PlayerSafeCase } from "@/types/case";
import type { InvestigationState } from "@/types/investigation";

/** Yerel demo profil metinleri — XP/level store'dan gelir. */
const PLAYER_PROFILE = {
  name: "Dedektif",
  rank: "Acemi Dedektif",
} as const;

function formatLevelLabel(level: number): string {
  return `LEVEL ${Math.max(1, Math.floor(level)).toString().padStart(2, "0")}`;
}

type TabId = "home" | "cases" | "profile" | "shop";

type TabItem = {
  id: TabId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  href?: "/case-story" | "/cases" | "/profile";
};

const TABS: TabItem[] = [
  {
    id: "home",
    label: "Ana Sayfa",
    icon: "home-outline",
    iconActive: "home",
  },
  {
    id: "cases",
    label: "Vakalar",
    icon: "folder-open-outline",
    iconActive: "folder-open",
    href: "/cases",
  },
  {
    id: "profile",
    label: "Profil",
    icon: "person-outline",
    iconActive: "person",
    href: "/profile",
  },
  {
    id: "shop",
    label: "Mağaza",
    icon: "storefront-outline",
    iconActive: "storefront",
  },
];

function Stars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <View style={styles.starRow}>
      {Array.from({ length: max }).map((_, index) => (
        <Ionicons
          key={index}
          name={index < value ? "star" : "star-outline"}
          size={11}
          color={index < value ? t.colors.gold : t.colors.mist}
        />
      ))}
    </View>
  );
}

function LivePulse() {
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.4, { duration: 900, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.liveDot, style]} />;
}

function XpBar({ progress }: { progress: number }) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(
      450,
      withTiming(Math.max(0.06, Math.min(progress, 1)), {
        duration: 1100,
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

function LoadingState() {
  return (
    <View style={styles.stateCenter}>
      <ActivityIndicator color={t.colors.gold} size="large" />
      <Text style={styles.stateHint}>Dedektif merkezi açılıyor…</Text>
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
      <Ionicons name="cloud-offline-outline" size={42} color={t.colors.gold} />
      <Text style={styles.errorTitle}>Merkez bağlantısı yok</Text>
      <Text style={styles.errorBody}>{message}</Text>
      <Pressable onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryText}>Yeniden dene</Text>
      </Pressable>
    </View>
  );
}

function BottomNav({
  active,
  onSelect,
  bottomInset,
  blurTarget,
}: {
  active: TabId;
  onSelect: (tab: TabItem) => void;
  bottomInset: number;
  blurTarget: RefObject<View | null>;
}) {
  return (
    <View style={[styles.navShell, { paddingBottom: Math.max(bottomInset, 10) }]}>
      <BlurView
        intensity={42}
        tint="dark"
        blurTarget={blurTarget}
        blurMethod="dimezisBlurViewSdk31Plus"
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["rgba(5, 7, 13, 0.55)", "rgba(10, 18, 36, 0.88)"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.navRow}>
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          return (
            <Pressable
              key={tab.id}
              onPress={() => onSelect(tab)}
              style={({ pressed }) => [
                styles.navItem,
                pressed && { opacity: 0.75 },
              ]}
            >
              {isActive ? <View style={styles.navActiveGlow} /> : null}
              <Ionicons
                name={isActive ? tab.iconActive : tab.icon}
                size={20}
                color={isActive ? t.colors.goldSoft : t.colors.mist}
              />
              <Text
                style={[styles.navLabel, isActive && styles.navLabelActive]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();


  const [caseData, setCaseData] = useState<PlayerSafeCase | null>(null);
  const [investigation, setInvestigation] =
    useState<InvestigationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const blurTargetRef = useRef<View | null>(null);
  const [levelProgress, setLevelProgress] = useState<LevelProgress>(() =>
    getPlayerProgressDetail()
  );

  useFocusEffect(
    useCallback(() => {
      const detail = getPlayerProgressDetail();
      setLevelProgress(getLevelProgress(detail.totalXp));
      setActiveTab("home");
    }, [])
  );

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setCaseData(null);
    setInvestigation(null);

    (async () => {
      try {
        const data = await fetchCase(DEFAULT_CASE_ID);
        if (cancelled) return;
        setCaseData(data);
        try {
          const state = await fetchInvestigationState(data.meta.id);
          if (!cancelled) setInvestigation(state);
        } catch {
          if (!cancelled) setInvestigation(null);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Bilinmeyen hata");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const horizontal = Math.max(t.spacing.lg, width * 0.05);
  const heroHeight = Math.min(Math.max(height * 0.42, 280), 420);
  const xpBarProgress = getLevelProgress(levelProgress.totalXp).progressRatio;
  const navHeight = 64 + Math.max(insets.bottom, 10);

  const progress = useMemo(() => {
    const totalEvidence = caseData?.evidence.length ?? 0;
    const totalSuspects = caseData?.suspects.length ?? 0;
    return {
      evidence: investigation?.discoveredEvidenceIds.length ?? 0,
      suspects: investigation?.interrogatedSuspectIds.length ?? 0,
      contradictions: investigation?.discoveredContradictionIds.length ?? 0,
      totalEvidence,
      totalSuspects,
    };
  }, [caseData, investigation]);

  const hasActiveInvestigation =
    (investigation?.discoveredEvidenceIds.length ?? 0) > 0 ||
    (investigation?.interrogatedSuspectIds.length ?? 0) > 0;

  const onTabSelect = (tab: TabItem) => {
    setActiveTab(tab.id);
    if (tab.id === "home") return;
    if (tab.href) {
      router.push(tab.href);
      return;
    }
    // Profil / Mağaza — henüz route yok; UI yerinde kalır
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      <Image
        source={gameImages.homeHeader}
        style={styles.bgImage}
        contentFit="cover"
        blurRadius={18}
      />
      <LinearGradient
        colors={[...t.media.bgWash]}
        locations={[...t.media.bgLocations]}
        style={StyleSheet.absoluteFill}
      />

      {(!caseData && !error) ? (
        <LoadingState />
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      ) : caseData ? (
        <>
          <BlurTargetView ref={blurTargetRef} style={styles.scroll}>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={{
                paddingBottom: navHeight + t.spacing.xl,
              }}
              showsVerticalScrollIndicator={false}
            >
            {/* Full-bleed opening plane */}
            <View style={[styles.heroPlane, { height: heroHeight }]}>
              <Image
                source={getCaseCover(caseData.meta.id)}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                transition={500}
              />
              <LinearGradient
                colors={[...t.media.heroWash]}
                locations={[...t.media.heroLocations]}
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
                <Animated.View entering={FadeIn.duration(700)}>
                  <Text style={styles.brandMark}>AI DETECTIVE</Text>
                  <Text style={styles.brandSub}>Noir soruşturma birimi</Text>
                </Animated.View>

                <View style={styles.heroActions}>
                  <View style={styles.statusChip}>
                    <LivePulse />
                    <Text style={styles.statusChipText}>ONLINE</Text>
                  </View>
                </View>
              </View>

              <Animated.View
                entering={FadeInUp.delay(180).duration(800)}
                style={[styles.heroBrandBlock, { paddingHorizontal: horizontal }]}
              >
                <Text style={styles.heroEyebrow}>GECE VARDİYASI</Text>
                <Text style={styles.heroTitle}>Gizemi çöz.</Text>
                <Text style={styles.heroLead}>
                  Kadıköy’ün yağmurlu sokaklarında bir dosya seni bekliyor.
                </Text>
              </Animated.View>
            </View>

            <View style={{ paddingHorizontal: horizontal, marginTop: -56 }}>
              {/* Rank / XP */}
              <Animated.View
                entering={FadeInUp.delay(220).duration(700)}
                style={[styles.rankPanel, t.shadow.deep]}
              >
                <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
                <LinearGradient
                  colors={[
                    "rgba(201, 162, 39, 0.16)",
                    "rgba(18, 28, 51, 0.92)",
                    "rgba(8, 14, 28, 0.96)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.rankTop}>
                  <View style={styles.avatarRing}>
                    <Image
                      source={gameImages.splash}
                      style={styles.avatarImage}
                      contentFit="cover"
                    />
                  </View>
                  <View style={styles.rankIdentity}>
                    <Text style={styles.rankHello}>Merhaba,</Text>
                    <Text style={styles.rankName}>{PLAYER_PROFILE.name}</Text>
                    <Text style={styles.rankTitle}>{PLAYER_PROFILE.rank}</Text>
                  </View>
                  <View style={styles.levelSeal}>
                    <Text style={styles.levelSealLabel}>LV</Text>
                    <Text style={styles.levelSealValue}>
                      {levelProgress.level.toString().padStart(2, "0")}
                    </Text>
                  </View>
                </View>
                <View style={styles.xpMeta}>
                  <Text style={styles.xpLabel}>
                    {formatLevelLabel(levelProgress.level)}
                  </Text>
                  <Text style={styles.xpValue}>
                    {levelProgress.xpIntoLevel} / {levelProgress.xpForNextLevel}{" "}
                    XP
                  </Text>
                </View>
                <XpBar progress={xpBarProgress} />
              </Animated.View>

              {/* Günün Vakası */}
              <Animated.View
                entering={FadeInUp.delay(320).duration(750)}
                style={styles.sectionHead}
              >
                <View>
                  <Text style={styles.sectionKicker}>01 · ÖNE ÇIKAN</Text>
                  <Text style={styles.sectionTitle}>Günün Vakası</Text>
                </View>
                <View style={styles.difficultyPill}>
                  <Text style={styles.difficultyPillText}>ZOR</Text>
                  <Stars value={4} />
                </View>
              </Animated.View>

              <Animated.View
                entering={FadeInUp.delay(360).duration(750)}
                style={t.shadow.deep}
              >
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/case-story",
                      params: { caseId: "case-001" },
                    })
                  }
                  style={({ pressed }) => [
                    styles.dayCase,
                    pressed && styles.pressed,
                  ]}
                >
                  <Image
                    source={getCaseCover(caseData.meta.id)}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    transition={350}
                  />
                  <LinearGradient
                    colors={[...t.media.heroWash]}
                    locations={[...t.media.heroLocations]}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.dayCaseTop}>
                    <View style={styles.dayBadge}>
                      <Ionicons
                        name="moon"
                        size={12}
                        color={t.colors.void}
                      />
                      <Text style={styles.dayBadgeText}>GÜNÜN VAKASI</Text>
                    </View>
                    <Text style={styles.dayCaseId}>
                      {caseData.meta.id.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.dayCaseVisualBreath} />
                  <View style={styles.dayCaseBody}>
                    <Text style={styles.dayCaseTitle}>{caseData.meta.title}</Text>
                    <Text style={styles.dayCaseSummary} numberOfLines={3}>
                      {caseData.meta.summary}
                    </Text>
                    <View style={styles.dayCaseMeta}>
                      <View style={styles.metaChip}>
                        <Ionicons
                          name="location-outline"
                          size={12}
                          color={t.colors.gold}
                        />
                        <Text style={styles.metaChipText} numberOfLines={1}>
                          {caseData.scene.name}
                        </Text>
                      </View>
                      <View style={styles.metaChip}>
                        <Ionicons
                          name="time-outline"
                          size={12}
                          color={t.colors.gold}
                        />
                        <Text style={styles.metaChipText}>
                          {caseData.time.timeOfCrime}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.ctaRow}>
                      <LinearGradient
                        colors={[t.colors.goldSoft, t.colors.gold, "#A8841A"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.primaryCta}
                      >
                        <Text style={styles.primaryCtaText}>VAKAYI AÇ</Text>
                        <Ionicons
                          name="arrow-forward"
                          size={16}
                          color={t.colors.void}
                        />
                      </LinearGradient>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>

              {/* Devam eden soruşturma */}
              <Animated.View
                entering={FadeInUp.delay(440).duration(700)}
                style={styles.sectionHead}
              >
                <View>
                  <Text style={styles.sectionKicker}>02 · AKTİF</Text>
                  <Text style={styles.sectionTitle}>Devam Eden Soruşturma</Text>
                </View>
              </Animated.View>

              <Animated.View entering={FadeInRight.delay(480).duration(700)}>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/case-investigation",
                      params: { caseId: DEFAULT_CASE_ID },
                    })
                  }
                  style={({ pressed }) => [
                    styles.continuePlane,
                    pressed && styles.pressed,
                  ]}
                >
                  <LinearGradient
                    colors={[
                      "rgba(26, 39, 68, 0.95)",
                      "rgba(10, 18, 36, 0.98)",
                    ]}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.continueAccent} />
                  <View style={styles.continueBody}>
                    <View style={styles.continueTop}>
                      <Text style={styles.continueStatus}>
                        {hasActiveInvestigation
                          ? "DEVAM EDİYOR"
                          : "HAZIR · BAŞLANMADI"}
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={t.colors.goldSoft}
                      />
                    </View>
                    <Text style={styles.continueTitle}>{caseData.meta.title}</Text>
                    <Text style={styles.continueLead} numberOfLines={2}>
                      {hasActiveInvestigation
                        ? "Dosyaya dön; şüpheliler ve deliller seni bekliyor."
                        : "Soruşturmayı başlat — ifadeler, deliller ve çelişkiler seni bekliyor."}
                    </Text>
                    <View style={styles.progressGrid}>
                      <View style={styles.progressCell}>
                        <Text style={styles.progressValue}>
                          {progress.evidence}/{progress.totalEvidence}
                        </Text>
                        <Text style={styles.progressLabel}>DELİL</Text>
                      </View>
                      <View style={styles.progressDivider} />
                      <View style={styles.progressCell}>
                        <Text style={styles.progressValue}>
                          {progress.suspects}/{progress.totalSuspects}
                        </Text>
                        <Text style={styles.progressLabel}>SORGU</Text>
                      </View>
                      <View style={styles.progressDivider} />
                      <View style={styles.progressCell}>
                        <Text style={styles.progressValue}>
                          {progress.contradictions}
                        </Text>
                        <Text style={styles.progressLabel}>ÇELİŞKİ</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>

              {/* Hızlı erişim */}
              <Animated.View
                entering={FadeInUp.delay(540).duration(700)}
                style={styles.sectionHead}
              >
                <View>
                  <Text style={styles.sectionKicker}>03 · ERİŞİM</Text>
                  <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
                </View>
              </Animated.View>

              <View style={styles.quickGrid}>
                <Animated.View
                  entering={FadeInUp.delay(580).duration(600)}
                  style={styles.quickWideWrap}
                >
                  <Pressable
                    onPress={() =>
                    router.push({
                      pathname: "/case-investigation",
                      params: { caseId: DEFAULT_CASE_ID },
                    })
                  }
                    style={({ pressed }) => [
                      styles.quickWide,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Image
                      source={gameImages.homeHeader}
                      style={StyleSheet.absoluteFill}
                      contentFit="cover"
                    />
                    <LinearGradient
                      colors={[
                        "rgba(5, 7, 13, 0.15)",
                        "rgba(5, 7, 13, 0.55)",
                        "rgba(5, 7, 13, 0.88)",
                      ]}
                      locations={[0, 0.45, 1]}
                      style={StyleSheet.absoluteFill}
                    />
                    <Ionicons
                      name="search"
                      size={22}
                      color={t.colors.goldSoft}
                    />
                    <Text style={styles.quickWideTitle}>Soruşturma</Text>
                    <Text style={styles.quickWideHint}>
                      Şüpheliler · Deliller
                    </Text>
                  </Pressable>
                </Animated.View>

                <Animated.View
                  entering={FadeInUp.delay(640).duration(600)}
                  style={styles.quickHalf}
                >
                  <Pressable
                    onPress={() =>
                    router.push({
                      pathname: "/case-story",
                      params: { caseId: "case-001" },
                    })
                  }
                    style={({ pressed }) => [
                      styles.quickTile,
                      pressed && styles.pressed,
                    ]}
                  >
                    <LinearGradient
                      colors={["rgba(26, 39, 68, 0.98)", "rgba(8, 14, 28, 1)"]}
                      style={StyleSheet.absoluteFill}
                    />
                    <Ionicons
                      name="book-outline"
                      size={20}
                      color={t.colors.gold}
                    />
                    <Text style={styles.quickTileTitle}>Hikaye</Text>
                    <Text style={styles.quickTileHint}>Dosyayı oku</Text>
                  </Pressable>
                </Animated.View>

                <Animated.View
                  entering={FadeInUp.delay(700).duration(600)}
                  style={styles.quickHalf}
                >
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/case-solve",
                        params: { caseId: DEFAULT_CASE_ID },
                      })
                    }
                    style={({ pressed }) => [
                      styles.quickTile,
                      styles.quickTileAccent,
                      pressed && styles.pressed,
                    ]}
                  >
                    <LinearGradient
                      colors={[
                        "rgba(201, 162, 39, 0.22)",
                        "rgba(18, 28, 51, 0.98)",
                      ]}
                      style={StyleSheet.absoluteFill}
                    />
                    <Ionicons name="flash" size={20} color={t.colors.goldSoft} />
                    <Text style={styles.quickTileTitle}>Vakayı Çöz</Text>
                    <Text style={styles.quickTileHint}>Suçlamayı kilitle</Text>
                  </Pressable>
                </Animated.View>
              </View>

              <Animated.View
                entering={FadeIn.delay(780).duration(700)}
                style={styles.footerSeal}
              >
                <View style={styles.footerLine} />
                <Text style={styles.footerText}>AI DETECTIVE · CASE UNIT</Text>
                <View style={styles.footerLine} />
              </Animated.View>
            </View>
          </ScrollView>
          </BlurTargetView>

          <BottomNav
            active={activeTab}
            onSelect={onTabSelect}
            bottomInset={insets.bottom}
            blurTarget={blurTargetRef}
          />
        </>
      ) : null}
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
    opacity: 0.55,
  },
  scroll: {
    flex: 1,
  },
  heroPlane: {
    width: "100%",
    justifyContent: "space-between",
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  brandMark: {
    fontFamily: t.typography.labelStrong,
    fontSize: 13,
    letterSpacing: t.typeRhythm.kickerTracking + 2,
    color: t.colors.goldSoft,
  },
  brandSub: {
    marginTop: 4,
    fontFamily: t.typography.displayItalic,
    fontSize: 14,
    letterSpacing: 0.3,
    color: t.colors.creamMuted,
  },
  heroActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.sm,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: t.colors.goldDim,
    backgroundColor: "rgba(5, 7, 13, 0.55)",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: t.colors.gold,
  },
  statusChipText: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 1.4,
    color: t.colors.goldSoft,
  },
  heroBrandBlock: {
    paddingBottom: 72,
  },
  heroEyebrow: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 3,
    color: t.colors.gold,
    marginBottom: 8,
  },
  heroTitle: {
    fontFamily: t.typography.hero,
    fontSize: 46,
    lineHeight: 50,
    letterSpacing: t.typeRhythm.heroTracking,
    color: t.colors.cream,
  },
  heroLead: {
    marginTop: 10,
    maxWidth: 280,
    fontFamily: t.typography.body,
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0.2,
    color: t.colors.creamMuted,
  },
  rankPanel: {
    borderRadius: t.radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: t.colors.line,
    padding: t.spacing.md,
    marginBottom: t.spacing.xl,
  },
  rankTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.md,
    marginBottom: t.spacing.md,
  },
  avatarRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: t.colors.gold,
    overflow: "hidden",
    ...t.shadow.glow,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  rankIdentity: {
    flex: 1,
    gap: 1,
  },
  rankHello: {
    fontFamily: t.typography.body,
    fontSize: 11,
    color: t.colors.mist,
  },
  rankName: {
    fontFamily: t.typography.display,
    fontSize: 22,
    color: t.colors.cream,
  },
  rankTitle: {
    fontFamily: t.typography.bodyMedium,
    fontSize: 12,
    color: t.colors.goldSoft,
  },
  levelSeal: {
    width: 54,
    height: 54,
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
    letterSpacing: 1.5,
    color: t.colors.mist,
  },
  levelSealValue: {
    fontFamily: t.typography.title,
    fontSize: 22,
    color: t.colors.goldSoft,
    marginTop: -2,
  },
  xpMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  xpLabel: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 1.8,
    color: t.colors.mist,
  },
  xpValue: {
    fontFamily: t.typography.bodyMedium,
    fontSize: 12,
    color: t.colors.creamMuted,
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
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: t.spacing.md,
    marginTop: t.spacing.sm,
  },
  sectionKicker: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 2,
    color: t.colors.gold,
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: t.typography.title,
    fontSize: 26,
    letterSpacing: t.typeRhythm.titleTracking,
    color: t.colors.cream,
  },
  difficultyPill: {
    alignItems: "flex-end",
    gap: 4,
  },
  difficultyPillText: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 1.6,
    color: t.colors.mist,
  },
  starRow: {
    flexDirection: "row",
    gap: 2,
  },
  dayCase: {
    height: 360,
    borderRadius: t.radius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: t.colors.line,
    justifyContent: "space-between",
    marginBottom: t.spacing.lg,
  },
  dayCaseTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: t.spacing.md,
  },
  dayCaseVisualBreath: {
    flexGrow: 1,
    minHeight: 120,
  },
  dayBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: t.colors.gold,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dayBadgeText: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 1.3,
    color: t.colors.void,
  },
  dayCaseId: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 1.5,
    color: t.colors.creamMuted,
  },
  dayCaseBody: {
    padding: t.spacing.lg,
    gap: 10,
  },
  dayCaseTitle: {
    fontFamily: t.typography.hero,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: t.typeRhythm.titleTracking,
    color: t.colors.cream,
  },
  dayCaseSummary: {
    fontFamily: t.typography.body,
    fontSize: 13,
    lineHeight: 21,
    letterSpacing: 0.15,
    color: t.colors.creamMuted,
  },
  dayCaseMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    maxWidth: "100%",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(243, 237, 224, 0.14)",
    backgroundColor: "rgba(5, 7, 13, 0.45)",
  },
  metaChipText: {
    fontFamily: t.typography.body,
    fontSize: 11,
    color: t.colors.creamMuted,
    maxWidth: 180,
  },
  ctaRow: {
    marginTop: 4,
    alignItems: "flex-start",
  },
  primaryCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 999,
    ...t.shadow.glow,
  },
  primaryCtaText: {
    fontFamily: t.typography.labelStrong,
    fontSize: 12,
    letterSpacing: 1.8,
    color: t.colors.void,
  },
  continuePlane: {
    borderRadius: t.radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: t.colors.line,
    flexDirection: "row",
    marginBottom: t.spacing.lg,
    minHeight: 168,
  },
  continueAccent: {
    width: 4,
    backgroundColor: t.colors.gold,
  },
  continueBody: {
    flex: 1,
    padding: t.spacing.md,
    gap: 8,
  },
  continueTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  continueStatus: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 1.6,
    color: t.colors.gold,
  },
  continueTitle: {
    fontFamily: t.typography.display,
    fontSize: 22,
    color: t.colors.cream,
  },
  continueLead: {
    fontFamily: t.typography.body,
    fontSize: 13,
    lineHeight: 19,
    color: t.colors.creamMuted,
  },
  progressGrid: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: t.colors.line,
    paddingTop: t.spacing.sm,
  },
  progressCell: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  progressDivider: {
    width: 1,
    height: 28,
    backgroundColor: t.colors.line,
  },
  progressValue: {
    fontFamily: t.typography.display,
    fontSize: 18,
    color: t.colors.cream,
  },
  progressLabel: {
    fontFamily: t.typography.label,
    fontSize: 9,
    letterSpacing: 1.2,
    color: t.colors.mist,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: t.spacing.sm,
  },
  quickWideWrap: {
    width: "100%",
  },
  quickWide: {
    height: 118,
    borderRadius: t.radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: t.colors.line,
    padding: t.spacing.md,
    justifyContent: "flex-end",
    gap: 2,
  },
  quickWideTitle: {
    fontFamily: t.typography.display,
    fontSize: 24,
    color: t.colors.cream,
  },
  quickWideHint: {
    fontFamily: t.typography.body,
    fontSize: 12,
    color: t.colors.creamMuted,
  },
  quickHalf: {
    width: "48.5%",
    flexGrow: 1,
  },
  quickTile: {
    minHeight: 112,
    borderRadius: t.radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: t.colors.line,
    padding: t.spacing.md,
    justifyContent: "flex-end",
    gap: 4,
  },
  quickTileAccent: {
    borderColor: t.colors.goldDim,
  },
  quickTileTitle: {
    fontFamily: t.typography.display,
    fontSize: 18,
    color: t.colors.cream,
  },
  quickTileHint: {
    fontFamily: t.typography.body,
    fontSize: 11,
    color: t.colors.mist,
  },
  footerSeal: {
    marginTop: t.spacing.xl,
    marginBottom: t.spacing.md,
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
    fontFamily: t.typography.label,
    fontSize: 9,
    letterSpacing: 2,
    color: t.colors.mist,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  navShell: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: t.colors.line,
    overflow: "hidden",
  },
  navRow: {
    flexDirection: "row",
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
  },
  navActiveGlow: {
    position: "absolute",
    top: 0,
    width: 28,
    height: 2,
    borderRadius: 1,
    backgroundColor: t.colors.gold,
  },
  navLabel: {
    fontFamily: t.typography.bodyMedium,
    fontSize: 10,
    color: t.colors.mist,
  },
  navLabelActive: {
    color: t.colors.goldSoft,
    fontFamily: t.typography.label,
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
