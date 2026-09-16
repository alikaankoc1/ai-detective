import { useState } from "react";
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
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { markOnboardingSeen } from "@/store/onboarding";
import { gameImages } from "@/constants/images";
import { detectiveTheme as t } from "@/constants/theme";

type Step = {
  index: string;
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const STEPS: Step[] = [
  {
    index: "01",
    title: "Bul",
    body: "Sahneyi tara. Delilleri keşfet, şüphelileri dinle.",
    icon: "search",
  },
  {
    index: "02",
    title: "Çelişki",
    body: "İfadeyi delille yüzleştir. Yalanı yakala.",
    icon: "git-compare-outline",
  },
  {
    index: "03",
    title: "Çöz",
    body: "Sorumlu, motif ve kanıtlayan delilleri seç.",
    icon: "shield-checkmark",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const horizontal = Math.max(t.spacing.lg, width * 0.055);
  const heroHeight = Math.min(Math.max(height * 0.42, 280), 420);
  const [busy, setBusy] = useState(false);

  const onContinue = async () => {
    if (busy) return;
    setBusy(true);
    await markOnboardingSeen();
    router.replace("/");
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />

      <LinearGradient
        colors={[t.colors.void, t.colors.navyDeep, "#02040A"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, t.spacing.md) + t.spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={[styles.hero, { height: heroHeight }]}>
          <Image
            source={gameImages.homeHeader}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={600}
          />
          <LinearGradient
            colors={[
              "rgba(5, 7, 13, 0.15)",
              "rgba(5, 7, 13, 0.35)",
              "rgba(5, 7, 13, 0.88)",
              t.colors.void,
            ]}
            locations={[0, 0.35, 0.72, 1]}
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
              <Text style={styles.brand}>AI DETECTIVE</Text>
              <Text style={styles.brandSub}>Noir soruşturma birimi</Text>
            </Animated.View>
          </View>

          <Animated.View
            entering={FadeInUp.delay(180).duration(700)}
            style={[styles.dialogueWrap, { paddingHorizontal: horizontal }]}
          >
            <View style={styles.dialogueRail} />
            <View style={styles.dialogueBody}>
              <Text style={styles.speaker}>Kıdemli Dedektif</Text>
              <Text style={styles.quote}>
                “Dosyalar soğumadan geldim. Bu gece arşiv açık — ama yalnız
                yürüyemem.
              </Text>
              <Text style={styles.quoteEmphasis}>
                Benimle gece vardiyasına var mısın?”
              </Text>
            </View>
          </Animated.View>
        </View>

        <View style={{ paddingHorizontal: horizontal }}>
          <Animated.View entering={FadeInDown.delay(280).duration(600)}>
            <Text style={styles.methodKicker}>YÖNTEM</Text>
            <Text style={styles.methodTitle}>Üç adım. Tek dosya.</Text>
            <Text style={styles.methodLead}>
              Her vaka aynı ritmi izler. Delili bulmak yetmez — suçlamada
              işaretlemen gerekir.
            </Text>
          </Animated.View>

          <View style={styles.steps}>
            {STEPS.map((step, index) => (
              <Animated.View
                key={step.title}
                entering={ZoomIn.delay(340 + index * 90).duration(480)}
                style={styles.stepCard}
              >
                <View style={styles.stepLeft}>
                  <Text style={styles.stepIndex}>{step.index}</Text>
                  <View style={styles.stepIcon}>
                    <Ionicons name={step.icon} size={18} color={t.colors.gold} />
                  </View>
                </View>
                <View style={styles.stepRight}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepBody}>{step.body}</Text>
                </View>
              </Animated.View>
            ))}
          </View>

          <Animated.View
            entering={FadeInUp.delay(620).duration(520)}
            style={styles.footer}
          >
            <Pressable
              onPress={() => void onContinue()}
              disabled={busy}
              style={({ pressed }) => [
                styles.cta,
                pressed && { opacity: 0.9 },
                busy && { opacity: 0.55 },
              ]}
            >
              <Text style={styles.ctaText}>Varım — vardiyaya gir</Text>
              <Ionicons name="arrow-forward" size={18} color={t.colors.void} />
            </Pressable>
            <Text style={styles.ctaHint}>İlk dosya seni masada bekliyor.</Text>
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
  hero: {
    width: "100%",
    justifyContent: "space-between",
    marginBottom: t.spacing.md,
  },
  heroTop: {
    gap: 4,
  },
  brand: {
    fontFamily: t.typography.label,
    fontSize: 12,
    letterSpacing: 4,
    color: t.colors.gold,
  },
  brandSub: {
    fontFamily: t.typography.displayItalic,
    fontSize: 14,
    color: t.colors.creamMuted,
  },
  dialogueWrap: {
    flexDirection: "row",
    gap: t.spacing.md,
    paddingBottom: t.spacing.lg,
  },
  dialogueRail: {
    width: 3,
    borderRadius: 2,
    backgroundColor: t.colors.gold,
    opacity: 0.85,
  },
  dialogueBody: {
    flex: 1,
    gap: 8,
  },
  speaker: {
    fontFamily: t.typography.label,
    fontSize: 11,
    letterSpacing: 1.8,
    color: t.colors.goldSoft,
  },
  quote: {
    fontFamily: t.typography.displayItalic,
    fontSize: 22,
    lineHeight: 30,
    color: t.colors.cream,
  },
  quoteEmphasis: {
    fontFamily: t.typography.hero,
    fontSize: 26,
    lineHeight: 32,
    color: t.colors.goldSoft,
  },
  methodKicker: {
    fontFamily: t.typography.label,
    fontSize: 11,
    letterSpacing: 2.4,
    color: t.colors.gold,
    marginBottom: 6,
  },
  methodTitle: {
    fontFamily: t.typography.title,
    fontSize: 28,
    lineHeight: 32,
    color: t.colors.cream,
    marginBottom: 8,
  },
  methodLead: {
    fontFamily: t.typography.body,
    fontSize: 14,
    lineHeight: 21,
    color: t.colors.mist,
    marginBottom: t.spacing.lg,
    maxWidth: 360,
  },
  steps: {
    gap: t.spacing.sm,
  },
  stepCard: {
    flexDirection: "row",
    gap: t.spacing.md,
    paddingVertical: t.spacing.md,
    paddingHorizontal: t.spacing.md,
    borderWidth: 1,
    borderColor: t.colors.line,
    borderRadius: t.radius.md,
    backgroundColor: "rgba(18, 28, 51, 0.55)",
  },
  stepLeft: {
    alignItems: "center",
    gap: 8,
    minWidth: 36,
  },
  stepIndex: {
    fontFamily: t.typography.label,
    fontSize: 11,
    letterSpacing: 1,
    color: t.colors.goldDim,
  },
  stepIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: t.colors.goldDim,
    backgroundColor: t.colors.goldFaint,
  },
  stepRight: {
    flex: 1,
    gap: 4,
    justifyContent: "center",
  },
  stepTitle: {
    fontFamily: t.typography.display,
    fontSize: 20,
    color: t.colors.cream,
  },
  stepBody: {
    fontFamily: t.typography.body,
    fontSize: 13,
    lineHeight: 19,
    color: t.colors.creamMuted,
  },
  footer: {
    marginTop: t.spacing.xl,
    gap: t.spacing.sm,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: t.spacing.sm,
    backgroundColor: t.colors.gold,
    paddingVertical: 16,
    paddingHorizontal: t.spacing.lg,
    borderRadius: t.radius.sm,
  },
  ctaText: {
    fontFamily: t.typography.labelStrong,
    fontSize: 15,
    letterSpacing: 0.3,
    color: t.colors.void,
  },
  ctaHint: {
    textAlign: "center",
    fontFamily: t.typography.body,
    fontSize: 12,
    color: t.colors.mist,
  },
});
