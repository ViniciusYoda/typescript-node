import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { buildApp } from "../src/app.ts";

test("limite de saldo e isolamento entre usuarios", async t => {
    const app = buildApp();
    t.after(() => app.close());
    const create = async (name: string) => (await app.inject({
        method: "POST", url: "/users", payload: { name },
    })).json();
    const first = await create("Primeiro");
    const second = await create("Segundo");
    const transact = (amount: number) => app.inject({
        method: "POST", url: `/users/${first.id}/transactions`,
        payload: { kind: "deposit", currency: "coins", amount },
    });
    assert.equal((await transact(Number.MAX_SAFE_INTEGER)).statusCode, 201);
    assert.equal((await transact(1)).statusCode, 400);
    const wallet = (await app.inject(`/users/${first.id}`)).json().wallet;
    assert.deepEqual(wallet, { coins: Number.MAX_SAFE_INTEGER, credits: 0 });
    assert.equal((await app.inject(`/users/${first.id}/transactions`)).json().data.length, 1);
    assert.deepEqual((await app.inject(`/users/${second.id}`)).json().wallet, { coins: 0, credits: 0 });
    assert.deepEqual((await app.inject(`/users/${second.id}/transactions`)).json().data, []);
});

test("CRUD e transacoes preservam o saldo e o historico", async t => {
    const app = buildApp();
    t.after(() => app.close());
    assert.equal((await app.inject("/health")).statusCode, 200);
    const created = await app.inject({ method: "POST", url: "/users", payload: { name: " Vini " } });
    assert.equal(created.statusCode, 201);
    const user = created.json();
    assert.equal(user.name, "Vini");
    const url = `/users/${user.id}`;
    assert.equal((await app.inject("/users")).json().data.length, 1);
    assert.equal((await app.inject(url)).statusCode, 200);
    assert.equal((await app.inject({ method: "PATCH", url, payload: { name: "Vinicius" } })).json().name, "Vinicius");
    const transact = (kind: string, amount: number) => app.inject({
        method: "POST", url: `${url}/transactions`, payload: { kind, currency: "credits", amount },
    });
    assert.equal((await transact("deposit", 100)).statusCode, 201);
    assert.equal((await transact("withdraw", 30)).json().balanceAfter, 70);
    assert.equal((await transact("withdraw", 100)).statusCode, 409);
    assert.equal((await app.inject(url)).json().wallet.credits, 70);
    assert.equal((await app.inject(`${url}/transactions`)).json().data.length, 2);
    assert.equal((await app.inject({ method: "DELETE", url })).statusCode, 204);
    assert.equal((await app.inject(url)).statusCode, 404);
});

test("rejeita entradas invalidas e usuarios inexistentes", async t => {
    const app = buildApp();
    t.after(() => app.close());
    for (const payload of [{}, { name: "   " }, { name: 1 }, { name: "Vini", admin: true }]) {
        assert.equal((await app.inject({ method: "POST", url: "/users", payload })).statusCode, 400);
    }
    assert.equal((await app.inject("/users/invalido")).statusCode, 400);
    assert.equal((await app.inject(`/users/${randomUUID()}`)).statusCode, 404);
    const user = (await app.inject({ method: "POST", url: "/users", payload: { name: "Vini" } })).json();
    for (const amount of [0, -1, 1.5, "10", Number.MAX_SAFE_INTEGER + 1]) {
        assert.equal((await app.inject({ method: "POST", url: `/users/${user.id}/transactions`,
            payload: { kind: "deposit", currency: "credits", amount } })).statusCode, 400);
    }
    assert.equal((await app.inject("/missing")).statusCode, 404);
    const otherApp = buildApp();
    t.after(() => otherApp.close());
    assert.deepEqual((await otherApp.inject("/users")).json(), { data: [] });
});
