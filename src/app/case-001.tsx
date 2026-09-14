import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { fetchCase001 } from "@/services/cases";
import type { Case } from "@/types/case";

/** case-001 verisini backend'den yükleyip ham olarak gösterir (UI tasarımı yok). */
export default function Case001Screen() {
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

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
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 16 }}>
        <Text>{error}</Text>
      </View>
    );
  }

  if (!caseData) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text>{caseData.meta.title}</Text>
      <Text>{caseData.meta.summary}</Text>
      <Text>{caseData.scene.name}</Text>
      <Text>{JSON.stringify(caseData, null, 2)}</Text>
    </ScrollView>
  );
}
