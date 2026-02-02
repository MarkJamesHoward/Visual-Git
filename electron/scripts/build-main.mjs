import { build } from "esbuild";

const measurementId = process.env.GA_MEASUREMENT_ID || "";
const apiSecret = process.env.GA_API_SECRET || "";
const debug = process.env.GA_DEBUG || "";

await build({
  entryPoints: ["src/main/main.ts"],
  bundle: true,
  platform: "node",
  external: ["electron"],
  outfile: "dist/main/main.js",
  define: {
    __GA_MEASUREMENT_ID__: JSON.stringify(measurementId),
    __GA_API_SECRET__: JSON.stringify(apiSecret),
    __GA_DEBUG__: JSON.stringify(debug),
  },
});
