import { defineConfig } from "vitest/config";
import path from "node:path";
export default defineConfig({test:{environment:"jsdom",setupFiles:["./vitest.setup.ts"],include:["tests/unit/**/*.test.{ts,tsx}"],coverage:{reporter:["text","html"]}},resolve:{alias:{"@":path.resolve(import.meta.dirname,"src")}}});
