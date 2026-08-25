import path from "node:path"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // The UI kit ships as TypeScript source (see its package.json "exports"),
  // so Next has to compile it rather than treat it as a built dependency.
  transpilePackages: ["@elvtr/ui-kit"],
  // The kit lives at the workspace root, one level above this app.
  outputFileTracingRoot: path.join(import.meta.dirname, "../.."),
}

export default nextConfig
