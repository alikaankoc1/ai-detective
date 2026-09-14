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
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
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
}: {
  evidence: Evidence;
  order: number;
  delay: number;
}) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(650)}>
      <View style={styles.evidenceCard}>
        <View style={styles.evidenceRail} />
        <View style={styles.evidenceBody}>
          <View style={styles.evidenceTopRow}>
            <Text style={styles.evidenceIndex}>
              D{order.toString().padStart(2, "0")}
            </Text>
            <Text style={styles.evidencePlace}>{evidence.discoveryLocation}</Text>
          </View>
          <Text style={styles.evidenceName}>{evidence.name}</Text>
          <Text style={styles.evidenceDescription}>{evidence.description}</Text>
        </View>
      </View>
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
}: {
  data: Case;
  onInterrogate: (suspectId: string) => void;
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
          <LinearGradient
            colors={["rgba(201, 162, 39, 0.14)", "rgba(18, 28, 51, 0.9)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
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
            />
          ))}
        </View>
      </View>

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

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      <LinearGradient
        colors={[t.colors.navy, t.colors.navyDeep, t.colors.void]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />
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

      {!fontsLoaded || (!caseData && !error) ? (
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
    fontFamily: t.typography.label,
    fontSize: 11,
    letterSpacing: 3,
    color: t.colors.gold,
    marginBottom: t.spacing.sm,
  },
  screenTitle: {
    fontFamily: t.typography.title,
    fontSize: 34,
    lineHeight: 40,
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
    padding: t.spacing.lg,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
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
