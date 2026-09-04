import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#f5f6f7",
        "bg-2": "#ffffff",
        ink: "#2b2f36",
        muted: "#8a8f99",
        rule: "#ebecef",
        accent: "#00d48f",
        "accent-2": "#00b377",
        "accent-soft": "rgba(0, 212, 143, 0.08)",
        "accent-deep": "#00a670",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
