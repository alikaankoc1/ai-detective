import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { hydratePlayerProgress } from "@/store/playerProgress";
import { appFontMap } from "@/constants/fonts";
import { detectiveTheme as t } from "@/constants/theme";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(appFontMap);
  const [progressReady, setProgressReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    hydratePlayerProgress().finally(() => {
      if (!cancelled) setProgressReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const ready = (fontsLoaded || Boolean(fontError)) && progressReady;

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

  return <Stack />;
}
