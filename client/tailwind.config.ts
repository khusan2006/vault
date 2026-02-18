import type { Config } from "tailwindcss";

/**
 * Tailwind config for the embedded Shopify admin UI.
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
