import type { ImageSourcePropType } from "react-native";

/** Oyun görselleri — tek kaynak. */
export const gameImages = {
  splash: require("../../assets/images/game/splash-detective.jpg") as ImageSourcePropType,
  /** Ana ekran üst hero — eski: home-header-istanbul.jpg */
  homeHeader: require("../../assets/images/game/home-header-detective-office.png") as ImageSourcePropType,
};

export const fallbackCover =
  require("../../assets/images/game/case-cover-lost-parcel.jpg") as ImageSourcePropType;

/** Vaka kapakları; bilinmeyen vaka için `fallbackCover` kullanılır.
 * Eski görseller assets/images/game içinde duruyor (case-cover-lost-parcel,
 * home-header-istanbul, case-001-cover) — gerekirse yeniden map edilebilir.
 */
const caseCovers: Record<string, ImageSourcePropType> = {
  "case-001": require("../../assets/images/game/case-002-cover-kayip-anahtar.png") as ImageSourcePropType,
  "case-002": require("../../assets/images/game/case-003-cover-son-metro.png") as ImageSourcePropType,
  "case-003": require("../../assets/images/game/case-004-cover-kirik-cini.png") as ImageSourcePropType,
  "case-004": require("../../assets/images/game/case-001-cover-0317.png") as ImageSourcePropType,
  // case-005 kapak: assets/images/game/case-005-cover-karatay-muhru.png gelince buraya ekle
};

export function getCaseCover(caseId: string): ImageSourcePropType {
  return caseCovers[caseId] ?? fallbackCover;
}
