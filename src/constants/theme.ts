/**
 * AI Detective — sinematik noir görsel dil.
 * Ana giriş ve vaka ekranlarının kalite standardını belirler.
 */
export const detectiveTheme = {
  colors: {
    void: "#05070D",
    navyDeep: "#0A1224",
    navy: "#121C33",
    navyLift: "#1A2744",
    ink: "#0E1628",
    gold: "#C9A227",
    goldSoft: "#E0C56A",
    goldDim: "rgba(201, 162, 39, 0.35)",
    goldFaint: "rgba(201, 162, 39, 0.12)",
    cream: "#F3EDE0",
    creamMuted: "rgba(243, 237, 224, 0.72)",
    mist: "rgba(243, 237, 224, 0.45)",
    danger: "#8B3A3A",
    overlay: "rgba(5, 7, 13, 0.55)",
    line: "rgba(201, 162, 39, 0.28)",
    glass: "rgba(10, 18, 36, 0.62)",
    glassHeavy: "rgba(5, 7, 13, 0.78)",
    smoke: "rgba(243, 237, 224, 0.08)",
  },
  /**
   * Image → gradient → text katmanları.
   * Üst/orta şeffaf (görsel görünsün), alt koyu (metin okunsun).
   */
  media: {
    heroWash: [
      "rgba(5, 7, 13, 0.12)",
      "rgba(5, 7, 13, 0.08)",
      "rgba(5, 7, 13, 0.55)",
      "rgba(5, 7, 13, 0.92)",
    ] as const,
    heroLocations: [0, 0.28, 0.62, 1] as const,
    cardWash: [
      "rgba(5, 7, 13, 0.08)",
      "rgba(5, 7, 13, 0.18)",
      "rgba(5, 7, 13, 0.72)",
      "rgba(5, 7, 13, 0.94)",
    ] as const,
    cardLocations: [0, 0.32, 0.68, 1] as const,
    pageWash: [
      "rgba(5, 7, 13, 0.25)",
      "rgba(5, 7, 13, 0.35)",
      "rgba(5, 7, 13, 0.78)",
      "#05070D",
    ] as const,
    pageLocations: [0, 0.35, 0.7, 1] as const,
    lockedWash: [
      "rgba(5, 7, 13, 0.35)",
      "rgba(5, 7, 13, 0.55)",
      "rgba(5, 7, 13, 0.82)",
    ] as const,
    lockedLocations: [0, 0.45, 1] as const,
    bgWash: [
      "rgba(5, 7, 13, 0.4)",
      "rgba(5, 7, 13, 0.55)",
      "#05070D",
      "#02040A",
    ] as const,
    bgLocations: [0, 0.35, 0.7, 1] as const,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
  },
  typography: {
    /** Büyük hero / vaka adı */
    hero: "CormorantGaramond_700Bold",
    /** Kart başlığı, section title */
    title: "CormorantGaramond_700Bold",
    /** Orta ağırlık display */
    display: "CormorantGaramond_600SemiBold",
    /** Alıntı, atmosfer, italik vurgu */
    displayItalic: "CormorantGaramond_600SemiBold_Italic",
    /** Alt başlık / unvan */
    subtitle: "CormorantGaramond_500Medium",
    /** Serif gövde (hikaye pasajı) */
    story: "CormorantGaramond_400Regular",
    /** Ana gövde UI */
    body: "Outfit_400Regular",
    /** Vurgu gövde */
    bodyMedium: "Outfit_500Medium",
    /** Küçük etiket / kicker */
    label: "Outfit_600SemiBold",
    /** CTA / güçlü etiket */
    labelStrong: "Outfit_700Bold",
  },
  /** Ortak metin ritmi — letterSpacing / lineHeight ipuçları */
  typeRhythm: {
    heroTracking: 0.2,
    titleTracking: 0.15,
    kickerTracking: 2.4,
    labelTracking: 1.6,
    bodyLineHeight: 1.55,
    displayLineHeight: 1.2,
  },
  shadow: {
    soft: {
      shadowColor: "#000",
      shadowOpacity: 0.35,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
    deep: {
      shadowColor: "#000",
      shadowOpacity: 0.55,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 14 },
      elevation: 14,
    },
    glow: {
      shadowColor: "#C9A227",
      shadowOpacity: 0.28,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 0 },
      elevation: 6,
    },
  },
} as const;

export type DetectiveTheme = typeof detectiveTheme;
