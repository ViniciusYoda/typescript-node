import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { buildApp } from "../dist/app.js";

test("JavaScript compilado atende as rotas sem tsx", async t => {
    const app = buildApp();
    t.after(() => app.close());
    assert.deepEqual((await app.inject("/health")).json(), { status: "ok" });
    const response = await app.inject({ method: "POST", url: "/users", payload: { name: "Build" } });
    assert.equal(response.statusCode, 201);
    assert.equal(response.json().name, "Build");
});

test("entrypoint compilado rejeita porta invalida", async () => {
    const child = spawn(process.execPath, ["--enable-source-maps", "dist/server.js"], {
        cwd: new URL("../", import.meta.url),
        env: { ...process.env, PORT: "invalid" },
        stdio: "pipe",
    });
    let output = "";
    child.stdout.on("data", chunk => { output += chunk; });
    child.stderr.on("data", chunk => { output += chunk; });
    const [exitCode] = await once(child, "close");
    assert.equal(exitCode, 1);
    assert.match(output, /PORT deve estar/);
});
