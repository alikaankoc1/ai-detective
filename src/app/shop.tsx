import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import {
  getQueryTokenBalance,
  grantDemoAdPack,
  hydrateQueryTokens,
  SHOP_PACKS,
  subscribeQueryTokens,
} from "@/store/queryTokens";
import { detectiveTheme as t } from "@/constants/theme";

type ShopProduct = {
  id: string;
  title: string;
  tokensLabel: string;
  body: string;
  cta: string;
  badge: string;
  icon: keyof typeof Ionicons.glyphMap;
  kind: "ad" | "iap" | "pass";
  accent?: boolean;
};

const PRODUCTS: ShopProduct[] = [
  {
    id: SHOP_PACKS.adPlus3.id,
    title: SHOP_PACKS.adPlus3.label,
    tokensLabel: "3 sorgu jetonu",
    body: "Kısa bir reklam izleyerek sorgu hakkını yenile. Delil keşfi ücretsiz kalır.",
    cta: "Reklam izle",
    badge: "REKLAM",
    icon: "play-circle-outline",
    kind: "ad",
    accent: true,
  },
  {
    id: SHOP_PACKS.iapPlus10.id,
    title: SHOP_PACKS.iapPlus10.label,
    tokensLabel: "10 sorgu jetonu",
    body: "Tek seferlik paket. Ödeme sistemi sonra bağlanacak.",
    cta: "Yakında",
    badge: "SATIN AL",
    icon: "diamond-outline",
    kind: "iap",
  },
  {
    id: SHOP_PACKS.adFree.id,
    title: SHOP_PACKS.adFree.label,
    tokensLabel: "Yüksek günlük kota",
    body: "Reklamsız deneyim ve genişletilmiş sorgu kotası. Demo sürümünde kapalı.",
    cta: "Yakında",
    badge: "PAKET",
    icon: "shield-checkmark-outline",
    kind: "pass",
  },
];

export default function ShopScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const horizontal = Math.max(t.spacing.lg, width * 0.05);

  const [balance, setBalance] = useState(getQueryTokenBalance);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeQueryTokens(setBalance);
    return unsub;
  }, []);

  useFocusEffect(
    useCallback(() => {
      void hydrateQueryTokens().then(setBalance);
      setNotice(null);
    }, [])
  );

  const onBuy = async (product: ShopProduct) => {
    if (busyId) return;
    setBusyId(product.id);
    setNotice(null);

    try {
      if (product.kind === "ad") {
        // Gerçek rewarded ad sonra; demoda bakiyeyi güncelle ki UI test edilebilsin
        const next = await grantDemoAdPack();
        setNotice(
          `Demo: +${SHOP_PACKS.adPlus3.tokens} jeton eklendi (bakiye ${next}). Reklam SDK sonra bağlanacak.`
        );
        return;
      }

      setNotice(
        "Ödeme sistemi henüz bağlı değil. Bu paket yakında açılacak."
      );
    } finally {
      setBusyId(null);
    }
  };

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
          paddingTop: insets.top + t.spacing.lg,
          paddingBottom: Math.max(insets.bottom, t.spacing.lg) + t.spacing.xl,
          paddingHorizontal: horizontal,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(450)}>
          <Pressable
            onPress={() => router.replace("/")}
            style={({ pressed }) => [
              styles.backRow,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="chevron-back" size={18} color={t.colors.goldSoft} />
            <Text style={styles.backText}>Ana Sayfa</Text>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(650)}>
          <Text style={styles.title}>Mağaza</Text>
          <Text style={styles.lead}>
            Sorgu jetonu: şüphelilere soru sormak ve delille yüzleştirmek için.
            XP harcanmaz; delil keşfi ücretsizdir.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(120).duration(600)}
          style={styles.balanceCard}
        >
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
          <View style={styles.balanceIcon}>
            <Ionicons name="chatbubbles" size={22} color={t.colors.void} />
          </View>
          <View style={styles.balanceBody}>
            <Text style={styles.balanceLabel}>KALAN SORGU JETONU</Text>
            <Text style={styles.balanceValue}>{balance}</Text>
          </View>
        </Animated.View>

        <Text style={styles.sectionKicker}>SORGU PAKETLERİ</Text>

        <View style={styles.list}>
          {PRODUCTS.map((product, index) => {
            const busy = busyId === product.id;
            const locked = product.kind !== "ad";
            return (
              <Animated.View
                key={product.id}
                entering={FadeInUp.delay(180 + index * 70).duration(550)}
              >
                <View
                  style={[
                    styles.productCard,
                    product.accent && styles.productCardAccent,
                  ]}
                >
                  <View style={styles.productTop}>
                    <View style={styles.productIcon}>
                      <Ionicons
                        name={product.icon}
                        size={22}
                        color={t.colors.gold}
                      />
                    </View>
                    <View style={styles.productBadge}>
                      <Text style={styles.productBadgeText}>{product.badge}</Text>
                    </View>
                  </View>
                  <Text style={styles.productTitle}>{product.title}</Text>
                  <Text style={styles.productTokens}>{product.tokensLabel}</Text>
                  <Text style={styles.productBody}>{product.body}</Text>
                  <Pressable
                    onPress={() => void onBuy(product)}
                    disabled={Boolean(busyId)}
                    style={({ pressed }) => [
                      styles.cta,
                      locked && styles.ctaLocked,
                      pressed && !busy && { opacity: 0.88 },
                      busy && { opacity: 0.6 },
                    ]}
                  >
                    <Text
                      style={[styles.ctaText, locked && styles.ctaTextLocked]}
                    >
                      {busy ? "…" : product.cta}
                    </Text>
                    {!locked ? (
                      <Ionicons
                        name="arrow-forward"
                        size={16}
                        color={t.colors.void}
                      />
                    ) : null}
                  </Pressable>
                </View>
              </Animated.View>
            );
          })}
        </View>

        {notice ? (
          <Animated.View entering={FadeIn.duration(300)}>
            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          </Animated.View>
        ) : null}

        <Text style={styles.footnote}>
          Ödeme ve reklam SDK bağlantısı sonraki adımda. Bu ekran vitrindir.
        </Text>
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
  title: {
    fontFamily: t.typography.hero,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: t.typeRhythm.heroTracking,
    color: t.colors.cream,
  },
  lead: {
    marginTop: t.spacing.sm,
    marginBottom: t.spacing.lg,
    fontFamily: t.typography.body,
    fontSize: 14,
    lineHeight: 22,
    color: t.colors.mist,
    maxWidth: 380,
  },
  balanceCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.md,
    padding: t.spacing.md,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.line,
    overflow: "hidden",
    marginBottom: t.spacing.xl,
  },
  balanceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.gold,
  },
  balanceBody: {
    flex: 1,
  },
  balanceLabel: {
    fontFamily: t.typography.label,
    fontSize: 11,
    letterSpacing: 1.6,
    color: t.colors.goldSoft,
    marginBottom: 4,
  },
  balanceValue: {
    fontFamily: t.typography.hero,
    fontSize: 36,
    lineHeight: 40,
    color: t.colors.cream,
  },
  sectionKicker: {
    fontFamily: t.typography.label,
    fontSize: 11,
    letterSpacing: 2,
    color: t.colors.gold,
    marginBottom: t.spacing.md,
  },
  list: {
    gap: t.spacing.md,
  },
  productCard: {
    padding: t.spacing.lg,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.line,
    backgroundColor: "rgba(18, 28, 51, 0.72)",
  },
  productCardAccent: {
    borderColor: "rgba(201, 162, 39, 0.45)",
  },
  productTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: t.spacing.md,
  },
  productIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: t.colors.goldDim,
    backgroundColor: t.colors.goldFaint,
  },
  productBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: t.colors.line,
  },
  productBadgeText: {
    fontFamily: t.typography.label,
    fontSize: 10,
    letterSpacing: 1.2,
    color: t.colors.goldSoft,
  },
  productTitle: {
    fontFamily: t.typography.title,
    fontSize: 26,
    lineHeight: 30,
    color: t.colors.cream,
    marginBottom: 4,
  },
  productTokens: {
    fontFamily: t.typography.bodyMedium,
    fontSize: 13,
    color: t.colors.gold,
    marginBottom: t.spacing.sm,
  },
  productBody: {
    fontFamily: t.typography.body,
    fontSize: 13,
    lineHeight: 20,
    color: t.colors.creamMuted,
    marginBottom: t.spacing.md,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: t.spacing.sm,
    backgroundColor: t.colors.gold,
    paddingVertical: 14,
    borderRadius: t.radius.sm,
  },
  ctaLocked: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: t.colors.line,
  },
  ctaText: {
    fontFamily: t.typography.label,
    fontSize: 14,
    letterSpacing: 0.4,
    color: t.colors.void,
  },
  ctaTextLocked: {
    color: t.colors.mist,
  },
  noticeBox: {
    marginTop: t.spacing.lg,
    padding: t.spacing.md,
    borderRadius: t.radius.sm,
    borderWidth: 1,
    borderColor: "rgba(201, 162, 39, 0.35)",
    backgroundColor: "rgba(201, 162, 39, 0.08)",
  },
  noticeText: {
    fontFamily: t.typography.body,
    fontSize: 13,
    lineHeight: 19,
    color: t.colors.creamMuted,
  },
  footnote: {
    marginTop: t.spacing.lg,
    fontFamily: t.typography.body,
    fontSize: 12,
    lineHeight: 18,
    color: t.colors.mist,
  },
});
