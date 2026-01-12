module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontSize: {
        xs: 11,
        sm: 13,
        base: 14,
        lg: 16,
        xl: 18,
        "2xl": 22,
        "3xl": 27,
        "4xl": 32,
        "5xl": 39,
      },
      colors: {
        lemonGreen: "#BBCC13",
        // Keep chartreuse for backward compatibility if needed, or remove
        chartreuse: "#BBCC13",
        darkGrey: "#212A2B",
        frenchGray: {
          light: "#57606D",
          dark: "#3D454B",
        },
        darkBrown: "#616A60",
        darkUmber: {
          light: "#2B3B3C",
          dark: "#212A2B",
        },
        transparentBlack: "rgba(0,0,0,0.45)",
        transparentWhite: "rgba(255,255,255,0.1)",
        textError: "#721c24",
        bgError: "#f8d7da",
        textSuccess: "#173a28",
        bgSuccess: "#cdeeaa",
      },
      fontFamily: {
        rthin: ["Inter_100Thin", "sans-serif"],
        rextralight: ["Inter_200ExtraLight", "sans-serif"],
        rlight: ["Inter_300Light", "sans-serif"],
        rregular: ["Inter_400Regular", "sans-serif"],
        rmedium: ["Inter_500Medium", "sans-serif"],
        rsemibold: ["Inter_600SemiBold", "sans-serif"],
        rbold: ["Inter_700Bold", "sans-serif"],
        rextrabold: ["Inter_800ExtraBold", "sans-serif"],
        rblack: ["Inter_900Black", "sans-serif"],
      },
    },
  },
  plugins: [],
};
