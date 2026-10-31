import { buildApp } from "./app.js";
const app = buildApp({ logger: true });
const port = Number(process.env.PORT ?? 3000);
try {
    if (!Number.isInteger(port) || port < 1 || port > 65535)
        throw new Error("PORT deve estar entre 1 e 65535.");
    await app.listen({ port, host: process.env.HOST ?? "127.0.0.1" });
}
catch (error) {
    app.log.error(error);
    process.exitCode = 1;
}
for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, () => {
        app.close().catch(error => {
            app.log.error(error);
            process.exitCode = 1;
        });
    });
}
