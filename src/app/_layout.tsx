import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { hydratePlayerProgress } from "@/store/playerProgress";
import { detectiveTheme as t } from "@/constants/theme";

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    hydratePlayerProgress().finally(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
