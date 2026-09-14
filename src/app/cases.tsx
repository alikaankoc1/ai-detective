import { useCallback, useMemo, useState } from "react";
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
import { getSolvedCaseIds } from "@/store/playerProgress";
import { detectiveTheme as t } from "@/constants/theme";
import { fallbackCover, gameImages, getCaseCover } from "@/constants/images";

type CaseFileBase = {
  id: string;
  fileLabel: string;
  title: string;
  summary: string;
  location?: string;
  difficulty?: string;
  cover: ReturnType<typeof getCaseCover>;
  /** Kilit açılmadan önceki ipucu */
  lockHint?: string;
};

type CaseFileView = CaseFileBase & {
  locked: boolean;
  solved: boolean;
  statusLabel: string;
  ctaLabel: string;
};

const CASE_LIBRARY: CaseFileBase[] = [
  {
    id: "case-001",
    fileLabel: "DOSYA CASE-001",
    title: "03:17'deki Telefon",
    summary:
      "Kadıköy'de bir gece, kurbanın telefonu 03:17'de çalar. Sabah ise cesedi bulunur. Üç şüpheli, bir sessiz arama ve karanlık bir sır.",
    location: "Kadıköy, Moda",
    difficulty: "ORTA",
    cover: getCaseCover("case-001"),
  },
  {
    id: "case-002",
    fileLabel: "DOSYA CASE-002",
    title: "Kayıp Paket",
    summary:
      "Şehirde kaybolan bir kargo, yanlış adrese giden izler ve suskun bir tanık.",
    location: "Karaköy",
    difficulty: "ORTA",
    lockHint: "Önceki vakayı çözerek açılır.",
    cover: fallbackCover,
  },
  {
    id: "case-003",
    fileLabel: "DOSYA CASE-003",
    title: "Son Tren",
    summary: "Daha fazla soruşturma gerekli.",
    lockHint: "Daha fazla soruşturma gerekli.",
    cover: gameImages.homeHeader,
  },
];

function buildCaseViews(solvedIds: readonly string[]): CaseFileView[] {
  const solved = new Set(solvedIds);
  const case001Solved = solved.has("case-001");

  return CASE_LIBRARY.map((item) => {
    if (item.id === "case-001") {
      const isSolved = case001Solved;
      return {
        ...item,
        locked: false,
        solved: isSolved,
        statusLabel: isSolved ? "SOLVED" : "GİZLİ SORUŞTURMA",
        ctaLabel: isSolved ? "DOSYAYI AÇ" : "VAKAYI İNCELE",
      };
    }

    if (item.id === "case-002") {
      const unlocked = case001Solved;
      return {
        ...item,
        locked: !unlocked,
        solved: solved.has("case-002"),
        statusLabel: unlocked
          ? solved.has("case-002")
            ? "SOLVED"
            : "YENİ DOSYA"
          : "KİLİTLİ",
        ctaLabel: "VAKAYI İNCELE",
        summary: unlocked
          ? item.summary
          : (item.lockHint ?? "Önceki vakayı çözerek açılır."),
      };
    }

    // case-003 — şimdilik kilitli
    return {
      ...item,
      locked: true,
      solved: false,
      statusLabel: "KİLİTLİ",
      ctaLabel: "VAKAYI İNCELE",
      summary: item.lockHint ?? item.summary,
    };
  });
}

function CaseFileRow({
  item,
  index,
  onOpen,
}: {
  item: CaseFileView;
  index: number;
  onOpen: () => void;
}) {
  const delay = 140 + index * 110;

  if (item.locked) {
    return (
      <Animated.View entering={FadeInUp.delay(delay).duration(700)}>
        <View style={[styles.card, styles.cardLocked, t.shadow.soft]}>
          <Image
            source={item.cover}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient
            colors={[
              "rgba(5, 7, 13, 0.72)",
              "rgba(8, 14, 28, 0.88)",
              "rgba(5, 7, 13, 0.96)",
            ]}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.lockOverlay}>
            <View style={styles.lockSeal}>
              <Ionicons name="lock-closed" size={22} color={t.colors.goldSoft} />
            </View>
            <Text style={styles.fileLabelMuted}>{item.fileLabel}</Text>
            <Text style={styles.lockedBadge}>KİLİTLİ</Text>
            <Text style={styles.lockedTitle}>{item.title}</Text>
            <Text style={styles.lockHint}>{item.lockHint ?? item.summary}</Text>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(700)}>
      <Pressable
        onPress={onOpen}
        style={({ pressed }) => [
          styles.card,
          item.solved && styles.cardSolved,
          t.shadow.deep,
          pressed && styles.pressed,
        ]}
      >
        <Image
          source={item.cover}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={350}
        />
        <LinearGradient
          colors={
            item.solved
              ? [
                  "rgba(201, 162, 39, 0.28)",
                  "rgba(5, 7, 13, 0.55)",
                  "rgba(3, 5, 10, 0.97)",
                ]
              : [
                  "rgba(5, 7, 13, 0.2)",
                  "rgba(5, 7, 13, 0.55)",
                  "rgba(3, 5, 10, 0.97)",
                ]
          }
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.cardTop}>
          <View style={styles.filePill}>
            <View style={styles.fileDot} />
            <Text style={styles.filePillText}>{item.fileLabel}</Text>
          </View>
          {item.solved ? (
            <View style={styles.solvedPill}>
              <Ionicons name="shield-checkmark" size={12} color={t.colors.void} />
              <Text style={styles.solvedPillText}>SOLVED</Text>
            </View>
          ) : (
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>{item.statusLabel}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.caseTitle}>{item.title}</Text>
          <Text style={styles.caseSummary}>{item.summary}</Text>

          {item.solved ? (
            <Text style={styles.solvedNote}>
              Dosya arşive alındı. Kayıtlar incelenmeye açık.
            </Text>
          ) : null}

          <View style={styles.metaRow}>
            {item.location ? (
              <View style={styles.metaChip}>
                <Ionicons
                  name="location-outline"
                  size={13}
                  color={t.colors.gold}
                />
                <Text style={styles.metaChipText}>{item.location}</Text>
              </View>
            ) : null}
            {item.difficulty ? (
              <View style={styles.metaChip}>
                <Ionicons name="flash-outline" size={13} color={t.colors.gold} />
                <Text style={styles.metaChipText}>{item.difficulty}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.ctaRow}>
            <LinearGradient
              colors={
                item.solved
                  ? ["#E8D48A", t.colors.goldSoft, t.colors.gold]
                  : [t.colors.goldSoft, t.colors.gold, "#A8841A"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaButton}
            >
              <Text style={styles.ctaText}>{item.ctaLabel}</Text>
              <Ionicons name="arrow-forward" size={16} color={t.colors.void} />
            </LinearGradient>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function CasesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const horizontal = Math.max(t.spacing.lg, width * 0.05);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_600SemiBold,
    CormorantGaramond_600SemiBold_Italic,
    CormorantGaramond_700Bold,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
  });

  const [solvedIds, setSolvedIds] = useState<string[]>(() => getSolvedCaseIds());

  useFocusEffect(
    useCallback(() => {
      setSolvedIds(getSolvedCaseIds());
    }, [])
  );

  const caseViews = useMemo(() => buildCaseViews(solvedIds), [solvedIds]);
  const totalCases = CASE_LIBRARY.length;
  const solvedCount = solvedIds.filter((id) =>
    CASE_LIBRARY.some((item) => item.id === id)
  ).length;

  if (!fontsLoaded) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient
          colors={[t.colors.void, t.colors.navyDeep]}
          style={StyleSheet.absoluteFill}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />

      <Image
        source={gameImages.homeHeader}
        style={styles.bgImage}
        contentFit="cover"
        blurRadius={16}
      />
      <LinearGradient
        colors={[
          "rgba(5, 7, 13, 0.7)",
          "rgba(5, 7, 13, 0.88)",
          t.colors.void,
          "#02040A",
        ]}
        locations={[0, 0.3, 0.65, 1]}
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
        <Animated.View entering={FadeIn.duration(550)}>
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

        <Animated.View entering={FadeInDown.delay(80).duration(700)}>
          <Text style={styles.kicker}>CASE FILES</Text>
          <Text style={styles.title}>Vaka Dosyaları</Text>
          <Text style={styles.solvedLine}>
            Çözülen: {solvedCount} / {totalCases}
          </Text>
          <View style={styles.rule}>
            <LinearGradient
              colors={["transparent", t.colors.gold, "transparent"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
          <Text style={styles.lead}>
            Arşivdeki soruşturma dosyaları. Açık vakalar inceleme için hazır;
            kilitli dosyalar henüz yetki dışında.
          </Text>
        </Animated.View>

        <View style={styles.list}>
          {caseViews.map((item, index) => (
            <CaseFileRow
              key={item.id}
              item={item}
              index={index}
              onOpen={() => {
                if (item.locked) return;
                // Case 001 oynanabilir; Case 002 açık olsa da gerçek veri yok —
                // şimdilik yalnızca case-story'ye gider (placeholder).
                if (item.id === "case-001" || item.id === "case-002") {
                  router.push("/case-story");
                }
              }}
            />
          ))}
        </View>

        <Animated.View
          entering={FadeIn.delay(520).duration(600)}
          style={styles.footerSeal}
        >
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>AI DETECTIVE · ARCHIVE</Text>
          <View style={styles.footerLine} />
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
    opacity: 0.28,
  },
  scroll: {
    flex: 1,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    marginBottom: t.spacing.md,
  },
  backText: {
    fontFamily: t.typography.label,
    color: t.colors.goldSoft,
    fontSize: 13,
    letterSpacing: 0.6,
  },
  kicker: {
    fontFamily: t.typography.label,
    fontSize: 12,
    letterSpacing: 4.5,
    color: t.colors.gold,
    marginBottom: 8,
  },
  title: {
    fontFamily: t.typography.title,
    fontSize: 40,
    lineHeight: 44,
    color: t.colors.cream,
  },
  solvedLine: {
    marginTop: 10,
    fontFamily: t.typography.bodyMedium,
    fontSize: 13,
    letterSpacing: 0.4,
    color: t.colors.creamMuted,
  },
  rule: {
    marginTop: t.spacing.md,
    marginBottom: t.spacing.md,
    height: 1,
    width: "100%",
    overflow: "hidden",
  },
  lead: {
    fontFamily: t.typography.body,
    fontSize: 14,
    lineHeight: 22,
    color: t.colors.mist,
    maxWidth: 360,
    marginBottom: t.spacing.lg,
  },
  list: {
    gap: t.spacing.md,
  },
  card: {
    minHeight: 300,
    borderRadius: t.radius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: t.colors.line,
    justifyContent: "space-between",
  },
  cardSolved: {
    borderColor: t.colors.gold,
  },
  cardLocked: {
    minHeight: 220,
    borderColor: "rgba(243, 237, 224, 0.12)",
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: t.spacing.sm,
    padding: t.spacing.md,
  },
  filePill: {
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
  fileDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: t.colors.gold,
  },
  filePillText: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 1.4,
    color: t.colors.goldSoft,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: t.colors.goldFaint,
    borderWidth: 1,
    borderColor: t.colors.goldDim,
  },
  statusPillText: {
    fontFamily: t.typography.label,
    fontSize: 9,
    letterSpacing: 1.2,
    color: t.colors.gold,
  },
  solvedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: t.colors.goldSoft,
  },
  solvedPillText: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 1.6,
    color: t.colors.void,
  },
  cardBody: {
    padding: t.spacing.lg,
    gap: 10,
  },
  caseTitle: {
    fontFamily: t.typography.title,
    fontSize: 30,
    lineHeight: 34,
    color: t.colors.cream,
  },
  caseSummary: {
    fontFamily: t.typography.body,
    fontSize: 13,
    lineHeight: 20,
    color: t.colors.creamMuted,
  },
  solvedNote: {
    fontFamily: t.typography.displayItalic,
    fontSize: 14,
    color: t.colors.goldSoft,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 2,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
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
  },
  ctaRow: {
    marginTop: 6,
    alignItems: "flex-start",
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
  },
  ctaText: {
    fontFamily: t.typography.label,
    fontSize: 12,
    letterSpacing: 1.6,
    color: t.colors.void,
  },
  lockOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.xl,
    gap: 8,
  },
  lockSeal: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: t.colors.goldDim,
    backgroundColor: "rgba(5, 7, 13, 0.65)",
    marginBottom: 6,
  },
  fileLabelMuted: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 1.6,
    color: t.colors.mist,
  },
  lockedBadge: {
    fontFamily: t.typography.label,
    fontSize: 12,
    letterSpacing: 3,
    color: t.colors.gold,
  },
  lockedTitle: {
    fontFamily: t.typography.display,
    fontSize: 24,
    color: t.colors.creamMuted,
    textAlign: "center",
  },
  lockHint: {
    fontFamily: t.typography.body,
    fontSize: 13,
    lineHeight: 19,
    color: t.colors.mist,
    textAlign: "center",
    maxWidth: 260,
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
    fontFamily: t.typography.label,
    fontSize: 9,
    letterSpacing: 2,
    color: t.colors.mist,
  },
});
