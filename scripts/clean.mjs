import { rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
// Apenas pastas geradas conhecidas, diretamente dentro do projeto.
for (const folder of ["dist", "dist-transpiled"]) {
    const target = resolve(root, folder);
    if (dirname(target) !== resolve(root)) throw new Error("Diretorio de limpeza invalido.");
    await rm(target, { recursive: true, force: true });
}
