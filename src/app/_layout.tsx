import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect, Stack, usePathname } from "expo-router";
import { useFonts } from "expo-font";
import { hydratePlayerProgress } from "@/store/playerProgress";
import {
  hasSeenOnboarding,
  subscribeOnboarding,
} from "@/store/onboarding";
import { appFontMap } from "@/constants/fonts";
import { detectiveTheme as t } from "@/constants/theme";

export default function RootLayout() {
  const pathname = usePathname();
  const [fontsLoaded, fontError] = useFonts(appFontMap);
  const [progressReady, setProgressReady] = useState(false);
  const [onboardingSeen, setOnboardingSeen] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    hydratePlayerProgress().finally(() => {
      if (!cancelled) setProgressReady(true);
    });
    hasSeenOnboarding().then((seen) => {
      if (!cancelled) setOnboardingSeen(seen);
    });
    const unsubscribe = subscribeOnboarding((seen) => {
      setOnboardingSeen(seen);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const ready =
    (fontsLoaded || Boolean(fontError)) &&
    progressReady &&
    onboardingSeen !== null;

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: t.colors.void,
        }}
      >
        <ActivityIndicator color={t.colors.gold} />
      </View>
    );
  }

  const onOnboardingRoute =
    pathname === "/onboarding" || pathname.startsWith("/onboarding");

  return (
    <>
      {!onboardingSeen && !onOnboardingRoute ? (
        <Redirect href="/onboarding" />
      ) : null}
      <Stack />
    </>
  );
}
