import Fastify from "fastify";
import type { FastifyError } from "fastify";
import { randomUUID } from "node:crypto";

interface User {
    id: string;
    name: string;
    createdAt: string;
    wallet: { coins: number; credits: number };
}

interface Transaction {
    id: string;
    userId: string;
    kind: "deposit" | "withdraw";
    currency: "coins" | "credits";
    amount: number;
    balanceAfter: number;
    createdAt: string;
}

const userParams = {
    type: "object",
    required: ["id"],
    properties: { id: { type: "string", format: "uuid" } },
    additionalProperties: false,
} as const;

const nameBody = {
    type: "object",
    required: ["name"],
    properties: { name: { type: "string", minLength: 1, maxLength: 100, pattern: "\\S" } },
    additionalProperties: false,
} as const;

// Cada instancia possui seu proprio armazenamento, inclusive nos testes.
export function buildApp(options: { logger?: boolean } = {}) {
    const app = Fastify({
        logger: options.logger ?? false,
        ajv: { customOptions: { removeAdditional: false, coerceTypes: false } },
    });
    const users = new Map<string, User>();
    const transactions: Transaction[] = [];

    app.setErrorHandler<FastifyError>((error, request, reply) => {
        if (error.validation) {
            return reply.code(400).send({ message: "Dados invalidos.", details: error.validation });
        }
        const status = error.statusCode && error.statusCode >= 400 && error.statusCode < 500
            ? error.statusCode : 500;
        if (status === 500) request.log.error(error);
        return reply.code(status).send({ message: status === 500 ? "Erro interno." : error.message });
    });
    app.setNotFoundHandler((_request, reply) => reply.code(404).send({ message: "Rota nao encontrada." }));

    app.get("/health", async () => ({ status: "ok" }));
    app.get("/users", async () => ({ data: [...users.values()] }));

    app.post<{ Body: { name: string } }>("/users", { schema: { body: nameBody } }, async (request, reply) => {
        const user: User = {
            id: randomUUID(), name: request.body.name.trim(), createdAt: new Date().toISOString(),
            wallet: { coins: 0, credits: 0 },
        };
        users.set(user.id, user);
        return reply.code(201).header("Location", `/users/${user.id}`).send(user);
    });

    app.get<{ Params: { id: string } }>("/users/:id", { schema: { params: userParams } }, async (request, reply) => {
        const user = users.get(request.params.id);
        return user ?? reply.code(404).send({ message: "Usuario nao encontrado." });
    });

    app.patch<{ Params: { id: string }; Body: { name: string } }>("/users/:id", {
        schema: { params: userParams, body: nameBody },
    }, async (request, reply) => {
        const user = users.get(request.params.id);
        if (!user) return reply.code(404).send({ message: "Usuario nao encontrado." });
        user.name = request.body.name.trim();
        return user;
    });

    app.delete<{ Params: { id: string } }>("/users/:id", { schema: { params: userParams } }, async (request, reply) => {
        if (!users.delete(request.params.id)) return reply.code(404).send({ message: "Usuario nao encontrado." });
        for (let index = transactions.length - 1; index >= 0; index--) {
            if (transactions[index]?.userId === request.params.id) transactions.splice(index, 1);
        }
        return reply.code(204).send();
    });

    app.get<{ Params: { id: string } }>("/users/:id/transactions", {
        schema: { params: userParams },
    }, async (request, reply) => {
        if (!users.has(request.params.id)) return reply.code(404).send({ message: "Usuario nao encontrado." });
        return { data: transactions.filter(transaction => transaction.userId === request.params.id) };
    });

    app.post<{ Params: { id: string }; Body: Pick<Transaction, "kind" | "currency" | "amount"> }>(
        "/users/:id/transactions",
        {
            schema: {
                params: userParams,
                body: {
                    type: "object", required: ["kind", "currency", "amount"], additionalProperties: false,
                    properties: {
                        kind: { type: "string", enum: ["deposit", "withdraw"] },
                        currency: { type: "string", enum: ["coins", "credits"] },
                        amount: { type: "integer", minimum: 1, maximum: Number.MAX_SAFE_INTEGER },
                    },
                },
            },
        },
        async (request, reply) => {
            const user = users.get(request.params.id);
            if (!user) return reply.code(404).send({ message: "Usuario nao encontrado." });
            const { kind, currency, amount } = request.body;
            const balanceAfter = user.wallet[currency] + (kind === "deposit" ? amount : -amount);
            if (balanceAfter < 0) return reply.code(409).send({ message: "Saldo insuficiente." });
            if (!Number.isSafeInteger(balanceAfter)) return reply.code(400).send({ message: "Limite de saldo excedido." });
            const transaction: Transaction = {
                id: randomUUID(), userId: user.id, kind, currency, amount, balanceAfter,
                createdAt: new Date().toISOString(),
            };
            user.wallet[currency] = balanceAfter;
            transactions.push(transaction);
            return reply.code(201).send(transaction);
        },
    );
    return app;
}
