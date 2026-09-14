import type { ImageSourcePropType } from "react-native";

/** Oyun görselleri — tek kaynak. */
export const gameImages = {
  splash: require("../../assets/images/game/splash-detective.jpg") as ImageSourcePropType,
  homeHeader: require("../../assets/images/game/home-header-istanbul.jpg") as ImageSourcePropType,
};

export const fallbackCover =
  require("../../assets/images/game/case-cover-lost-parcel.jpg") as ImageSourcePropType;

/** Vaka kapakları; bilinmeyen vaka için `fallbackCover` kullanılır. */
const caseCovers: Record<string, ImageSourcePropType> = {
  "case-001": require("../../assets/images/game/case-001-cover.jpg") as ImageSourcePropType,
};

export function getCaseCover(caseId: string): ImageSourcePropType {
  return caseCovers[caseId] ?? fallbackCover;
}
