import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { markOnboardingSeen } from "@/store/onboarding";
import { detectiveTheme as t } from "@/constants/theme";

type Step = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    icon: "search",
    title: "Bul",
    body: "Sahneyi tara, delilleri keşfet, şüphelileri sorgula.",
  },
  {
    icon: "git-compare-outline",
    title: "Çelişki",
    body: "İfadeleri delillerle yüzleştir; tutarsızlıkları yakala.",
  },
  {
    icon: "shield-checkmark",
    title: "Çöz",
    body: "Sorumluyu ve motifi seç; suçlamayı kanıtlayan delilleri işaretle.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const horizontal = Math.max(t.spacing.lg, width * 0.06);
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

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + t.spacing.xl,
            paddingBottom: Math.max(insets.bottom, t.spacing.lg) + t.spacing.md,
            paddingHorizontal: horizontal,
          },
        ]}
      >
        <Animated.View entering={FadeIn.duration(500)}>
          <Text style={styles.brand}>AI DETECTIVE</Text>
          <Text style={styles.kicker}>NASIL OYNANIR</Text>
          <Text style={styles.headline}>Bul → Çelişki → Çöz</Text>
          <Text style={styles.lead}>
            Her vaka aynı üç adımı izler. Delil sadece bulmak yetmez —
            çözüm ekranında suçlamayı destekleyenleri seçmen gerekir.
          </Text>
        </Animated.View>

        <View style={styles.steps}>
          {STEPS.map((step, index) => (
            <Animated.View
              key={step.title}
              entering={FadeInDown.delay(120 + index * 90).duration(520)}
              style={styles.stepRow}
            >
              <View style={styles.stepIndex}>
                <Text style={styles.stepIndexText}>
                  {String(index + 1).padStart(2, "0")}
                </Text>
              </View>
              <View style={styles.stepIcon}>
                <Ionicons name={step.icon} size={22} color={t.colors.gold} />
              </View>
              <View style={styles.stepBody}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepText}>{step.body}</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        <Animated.View
          entering={FadeInUp.delay(420).duration(500)}
          style={styles.footer}
        >
          <Pressable
            onPress={() => void onContinue()}
            disabled={busy}
            style={({ pressed }) => [
              styles.cta,
              pressed && { opacity: 0.88 },
              busy && { opacity: 0.6 },
            ]}
          >
            <Text style={styles.ctaText}>Anladım — başla</Text>
            <Ionicons name="arrow-forward" size={18} color={t.colors.void} />
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: t.colors.void,
  },
  content: {
    flex: 1,
  },
  brand: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 12,
    letterSpacing: 4,
    color: t.colors.gold,
    marginBottom: t.spacing.sm,
  },
  kicker: {
    fontFamily: "Outfit_500Medium",
    fontSize: 11,
    letterSpacing: 2.4,
    color: t.colors.mist,
    marginBottom: t.spacing.xs,
  },
  headline: {
    fontFamily: "CormorantGaramond_700Bold",
    fontSize: 36,
    lineHeight: 40,
    color: t.colors.cream,
    marginBottom: t.spacing.md,
  },
  lead: {
    fontFamily: "Outfit_400Regular",
    fontSize: 15,
    lineHeight: 22,
    color: t.colors.creamMuted,
    marginBottom: t.spacing.xl,
  },
  steps: {
    flex: 1,
    gap: t.spacing.md,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: t.spacing.sm,
    paddingVertical: t.spacing.md,
    paddingHorizontal: t.spacing.md,
    borderWidth: 1,
    borderColor: t.colors.line,
    backgroundColor: "rgba(18, 28, 51, 0.55)",
  },
  stepIndex: {
    paddingTop: 2,
    minWidth: 28,
  },
  stepIndexText: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 12,
    letterSpacing: 1,
    color: t.colors.goldDim,
  },
  stepIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: t.colors.goldDim,
    backgroundColor: t.colors.goldFaint,
  },
  stepBody: {
    flex: 1,
    gap: 4,
  },
  stepTitle: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 22,
    color: t.colors.cream,
  },
  stepText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 14,
    lineHeight: 20,
    color: t.colors.creamMuted,
  },
  footer: {
    marginTop: t.spacing.lg,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: t.spacing.sm,
    backgroundColor: t.colors.gold,
    paddingVertical: 16,
    paddingHorizontal: t.spacing.lg,
  },
  ctaText: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 15,
    letterSpacing: 0.4,
    color: t.colors.void,
  },
});
