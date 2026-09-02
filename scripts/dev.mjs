// Lanza `next dev` forzando que .env.local gane sobre variables heredadas del
// entorno. Contexto: el entorno del que se lanza el dev (p. ej. la IDE) puede
// tener exportadas variables del proyecto de un cliente anterior
// (KLIPPER_ORG_SLUG, NEXT_PUBLIC_*, etc.). En Next, las variables del proceso
// tienen prioridad sobre .env.local, así que esos valores viejos pisaban la
// config real y se mostraban datos del cliente equivocado. Este wrapper lee
// .env.local y sobreescribe process.env con sus valores antes de arrancar.
import { spawn } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");

const env = { ...process.env };

if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    // Quita comillas envolventes si las hay.
    const value = line
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    // .env.local manda: sobreescribe cualquier valor heredado del entorno.
    env[key] = value;
  }
}

const child = spawn("next", ["dev", "-p", "3800"], {
  stdio: "inherit",
  env,
  cwd: root,
});

child.on("exit", (code) => process.exit(code ?? 0));
