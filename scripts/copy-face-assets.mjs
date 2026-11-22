// Copies the face library and the models it needs into public/noprecache/face,
// so the browser loads them from our own domain. "noprecache" keeps the ~13 MB
// out of the offline install: phones only download it when the camera opens.
import { cpSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const pkgDir = join(process.cwd(), "node_modules", "@vladmandic", "human");
if (!existsSync(join(pkgDir, "package.json"))) throw new Error("Run npm install first: @vladmandic/human is missing");
const out = join(process.cwd(), "public", "noprecache", "face");
mkdirSync(join(out, "models"), { recursive: true });

cpSync(join(pkgDir, "dist", "human.esm.js"), join(out, "human.esm.js"));
const models = ["blazeface", "facemesh", "iris", "faceres", "antispoof", "liveness"];
for (const m of models) {
  for (const ext of ["json", "bin"]) {
    const src = join(pkgDir, "models", `${m}.${ext}`);
    if (!existsSync(src)) throw new Error(`Missing face model file: ${src}`);
    cpSync(src, join(out, "models", `${m}.${ext}`));
  }
}
console.log(`face assets copied to ${out}`);
