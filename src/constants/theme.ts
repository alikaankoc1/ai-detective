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
    display: "CormorantGaramond_600SemiBold",
    displayItalic: "CormorantGaramond_600SemiBold_Italic",
    title: "CormorantGaramond_700Bold",
    body: "Outfit_400Regular",
    bodyMedium: "Outfit_500Medium",
    label: "Outfit_600SemiBold",
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
