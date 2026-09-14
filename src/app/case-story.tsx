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
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
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
import { getCaseCover } from "@/constants/images";
import type { Case } from "@/types/case";

function CaseBadge({ id }: { id: string }) {
  return (
    <View style={styles.badge}>
      <View style={styles.badgeDot} />
      <Text style={styles.badgeText}>DOSYA {id.toUpperCase()}</Text>
    </View>
  );
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={styles.chipValue}>{value}</Text>
    </View>
  );
}

function GoldRule() {
  return (
    <View style={styles.ruleRow}>
      <LinearGradient
        colors={["transparent", t.colors.gold, "transparent"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.rule}
      />
    </View>
  );
}

function StoryBody({ text }: { text: string }) {
  const paragraphs = text
    .split(/(?<=\.)\s+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <View style={styles.storyBlock}>
      {paragraphs.map((paragraph, index) => (
        <Text key={index} style={styles.storyParagraph}>
          {paragraph}
        </Text>
      ))}
    </View>
  );
}

function LoadingState() {
  return (
    <View style={styles.stateCenter}>
      <ActivityIndicator color={t.colors.gold} size="large" />
      <Text style={styles.stateHint}>Dosya açılıyor…</Text>
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
      <Text style={styles.errorTitle}>Bağlantı kesildi</Text>
      <Text style={styles.errorBody}>{message}</Text>
      <Pressable onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryText}>Yeniden dene</Text>
      </Pressable>
    </View>
  );
}

function CaseStoryContent({
  data,
  onInvestigate,
}: {
  data: Case;
  onInvestigate: () => void;
}) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const horizontal = Math.max(t.spacing.lg, width * 0.06);

  return (
    <View style={styles.contentShell}>
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
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(700)}>
          <CaseBadge id={data.meta.id} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(800)}>
          <Text style={styles.kicker}>GİZLİ SORUŞTURMA</Text>
          <Text style={styles.title}>{data.meta.title}</Text>
          <Text style={styles.summary}>{data.meta.summary}</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(280).duration(700)}>
          <GoldRule />
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(320).duration(700)}
          style={styles.metaGrid}
        >
          <MetaChip label="KONUM" value={data.scene.name} />
          <MetaChip
            label="ZAMAN"
            value={`${data.time.dateLabel} · ${data.time.timeOfCrime}`}
          />
          {data.time.atmosphere ? (
            <MetaChip label="ATMOSFER" value={data.time.atmosphere} />
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(420).duration(800)}>
          <View style={styles.sceneCard}>
            <LinearGradient
              colors={["rgba(26, 39, 68, 0.95)", "rgba(10, 18, 36, 0.92)"]}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.sceneEyebrow}>OLAY YERİ</Text>
            <Text style={styles.sceneName}>{data.scene.name}</Text>
            <Text style={styles.sceneDescription}>{data.scene.description}</Text>
            <View style={styles.sceneDetailRule} />
            <Text style={styles.sceneDetails}>{data.scene.details}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(520).duration(800)}>
          <Text style={styles.sectionLabel}>HİKÂYE GİRİŞİ</Text>
          <StoryBody text={data.story} />
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(700).duration(900)}
          style={styles.footer}
        >
          <GoldRule />
          <Text style={styles.footerNote}>
            Gerçekler kilitlendi. İfadeler yanıltabilir.
          </Text>
        </Animated.View>
      </ScrollView>

      <Animated.View
        entering={FadeInUp.delay(500).duration(600)}
        style={[styles.ctaBar, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        <LinearGradient
          colors={["transparent", "rgba(5, 7, 13, 0.92)", t.colors.void]}
          style={styles.ctaFade}
          pointerEvents="none"
        />
        <Pressable
          onPress={onInvestigate}
          style={({ pressed }) => [
            styles.ctaButton,
            pressed && styles.ctaButtonPressed,
          ]}
        >
          <LinearGradient
            colors={[t.colors.goldSoft, t.colors.gold, "#A8841A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaLabel}>VAKAYI İNCELE</Text>
            <Text style={styles.ctaArrow}>›</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}

export default function CaseStoryScreen() {
  const router = useRouter();
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

  const ready = fontsLoaded;

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
            colors={[
              "rgba(5, 7, 13, 0.35)",
              "rgba(5, 7, 13, 0.75)",
              t.colors.void,
            ]}
            locations={[0, 0.6, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>
      ) : null}

      {/* Atmospheric vignette layers */}
      <LinearGradient
        colors={["rgba(201, 162, 39, 0.08)", "transparent", "transparent"]}
        style={styles.topGlow}
        pointerEvents="none"
      />
      <LinearGradient
        colors={["transparent", "rgba(5, 7, 13, 0.85)"]}
        style={styles.bottomVignette}
        pointerEvents="none"
      />

      <Pressable
        onPress={() => router.back()}
        style={[styles.backButton, { top: insets.top + 8 }]}
        hitSlop={12}
      >
        <Text style={styles.backText}>←</Text>
      </Pressable>

      {!ready || (!caseData && !error) ? (
        <LoadingState />
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      ) : caseData ? (
        <CaseStoryContent
          data={caseData}
          onInvestigate={() => router.push("/case-investigation")}
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
    height: "52%",
  },
  topGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 220,
  },
  bottomVignette: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 160,
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
    backgroundColor: "rgba(10, 18, 36, 0.7)",
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
  contentShell: {
    flex: 1,
  },
  scrollContent: {
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
  },
  ctaBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: t.spacing.lg,
    paddingTop: t.spacing.xl,
  },
  ctaFade: {
    ...StyleSheet.absoluteFill,
    top: -40,
  },
  ctaButton: {
    borderRadius: t.radius.md,
    overflow: "hidden",
    shadowColor: t.colors.gold,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  ctaButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  ctaGradient: {
    minHeight: 56,
    paddingHorizontal: t.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  ctaLabel: {
    fontFamily: t.typography.label,
    fontSize: 15,
    letterSpacing: 2.4,
    color: t.colors.void,
  },
  ctaArrow: {
    fontFamily: t.typography.title,
    fontSize: 28,
    lineHeight: 28,
    color: t.colors.void,
    marginTop: -2,
  },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: t.colors.goldDim,
    backgroundColor: t.colors.goldFaint,
    marginBottom: t.spacing.lg,
    marginLeft: 44,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: t.colors.gold,
  },
  badgeText: {
    fontFamily: t.typography.label,
    fontSize: 11,
    letterSpacing: 2.4,
    color: t.colors.goldSoft,
  },
  kicker: {
    fontFamily: t.typography.label,
    fontSize: 11,
    letterSpacing: 3.2,
    color: t.colors.gold,
    marginBottom: t.spacing.sm,
  },
  title: {
    fontFamily: t.typography.title,
    fontSize: 40,
    lineHeight: 46,
    color: t.colors.cream,
    marginBottom: t.spacing.md,
  },
  summary: {
    fontFamily: t.typography.displayItalic,
    fontSize: 18,
    lineHeight: 28,
    color: t.colors.creamMuted,
  },
  ruleRow: {
    marginVertical: t.spacing.xl,
  },
  rule: {
    height: 1,
    width: "100%",
  },
  metaGrid: {
    gap: t.spacing.sm,
    marginBottom: t.spacing.xl,
  },
  chip: {
    borderLeftWidth: 2,
    borderLeftColor: t.colors.gold,
    paddingLeft: t.spacing.md,
    paddingVertical: t.spacing.sm,
    backgroundColor: "rgba(18, 28, 51, 0.55)",
    borderRadius: t.radius.sm,
  },
  chipLabel: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 2,
    color: t.colors.gold,
    marginBottom: 4,
  },
  chipValue: {
    fontFamily: t.typography.bodyMedium,
    fontSize: 14,
    lineHeight: 21,
    color: t.colors.cream,
  },
  sceneCard: {
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.line,
    padding: t.spacing.lg,
    overflow: "hidden",
    marginBottom: t.spacing.xxl,
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  sceneEyebrow: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 2.6,
    color: t.colors.gold,
    marginBottom: t.spacing.sm,
  },
  sceneName: {
    fontFamily: t.typography.display,
    fontSize: 22,
    lineHeight: 28,
    color: t.colors.cream,
    marginBottom: t.spacing.sm,
  },
  sceneDescription: {
    fontFamily: t.typography.body,
    fontSize: 15,
    lineHeight: 24,
    color: t.colors.creamMuted,
  },
  sceneDetailRule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: t.colors.goldDim,
    marginVertical: t.spacing.md,
  },
  sceneDetails: {
    fontFamily: t.typography.body,
    fontSize: 13,
    lineHeight: 21,
    color: t.colors.mist,
  },
  sectionLabel: {
    fontFamily: t.typography.label,
    fontSize: 11,
    letterSpacing: 3,
    color: t.colors.gold,
    marginBottom: t.spacing.md,
  },
  storyBlock: {
    gap: t.spacing.md,
  },
  storyParagraph: {
    fontFamily: t.typography.body,
    fontSize: 16,
    lineHeight: 28,
    color: t.colors.cream,
  },
  footer: {
    marginTop: t.spacing.xxl,
    alignItems: "center",
  },
  footerNote: {
    fontFamily: t.typography.displayItalic,
    fontSize: 14,
    color: t.colors.mist,
    textAlign: "center",
    marginTop: t.spacing.md,
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
    letterSpacing: 0.5,
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
