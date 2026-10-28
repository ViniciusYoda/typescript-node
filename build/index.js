// Tipos primitivos
const myName = "Vini";
const age = 25;
const isActive = true;
// Arrays: todos os elementos devem ter o tipo indicado.
const scores = [7, 8, 10];
const languages = ["JavaScript", "TypeScript"];
// Union: aceita mais de um tipo.
const userId = "user-1";
// Os parametros e o retorno da funcao recebem tipos.
function sum(a, b) {
    return a + b;
}
console.log({ myName, age, isActive, scores, languages, userId });
function validateName(name) {
    const trimmedName = name.trim();
    if (!trimmedName) {
        throw new Error("O nome nao pode ficar vazio.");
    }
    return trimmedName;
}
function createUser(input) {
    return {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        name: validateName(input.name),
        ...(input.email !== undefined ? { email: input.email } : {}),
        wallet: { coins: 0, credits: 0 },
        talk(message) {
            console.log(`${this.name}: ${message}`);
        },
    };
}
function updateUser(user, input) {
    if (input.name !== undefined) {
        user.name = validateName(input.name);
    }
    if (input.email !== undefined) {
        user.email = input.email;
    }
}
function createWalletService() {
    const transactions = [];
    function transact(user, currency, amount, kind) {
        // Tipos nao validam valores em tempo de execucao.
        if (!Number.isSafeInteger(amount) || amount <= 0) {
            throw new Error("O valor deve ser um inteiro positivo seguro.");
        }
        const currentBalance = user.wallet[currency];
        if (!Number.isSafeInteger(currentBalance) || currentBalance < 0) {
            throw new Error("Saldo atual invalido.");
        }
        if (kind === "withdraw" && currentBalance < amount) {
            throw new Error("Saldo insuficiente.");
        }
        const balanceAfter = kind === "deposit"
            ? sum(currentBalance, amount)
            : currentBalance - amount;
        if (!Number.isSafeInteger(balanceAfter)) {
            throw new Error("O saldo ultrapassa o limite permitido.");
        }
        const transaction = {
            id: crypto.randomUUID(),
            createdAt: new Date(),
            userId: user.id,
            currency,
            kind,
            amount,
            balanceAfter,
        };
        user.wallet[currency] = balanceAfter;
        transactions.push(transaction);
        return {
            data: transaction,
            message: kind === "deposit" ? "Deposito realizado." : "Saque realizado.",
        };
    }
    return {
        deposit(user, currency, amount) {
            return transact(user, currency, amount, "deposit");
        },
        withdraw(user, currency, amount) {
            return transact(user, currency, amount, "withdraw");
        },
        history(userId) {
            // Retorna copias para preservar os registros internos.
            return transactions
                .filter(transaction => transaction.userId === userId)
                .map(transaction => ({
                ...transaction,
                createdAt: new Date(transaction.createdAt),
            }));
        },
    };
}
// Exemplo completo: criacao, atualizacao, deposito, saque e historico.
const rincko = createUser({ name: myName });
const walletService = createWalletService();
updateUser(rincko, { email: "vini@example.com" });
rincko.talk("Aprendendo interfaces com TypeScript!");
console.log(walletService.deposit(rincko, "credits", 100));
console.log(walletService.withdraw(rincko, "credits", 30));
console.log(walletService.deposit(rincko, "coins", 10));
console.log("Carteira:", rincko.wallet);
console.log("Historico:", walletService.history(rincko.id));
try {
    walletService.withdraw(rincko, "credits", 200);
}
catch (error) {
    console.log(error instanceof Error ? error.message : "Erro desconhecido.");
}
const formatBalance = ([currency, balance]) => `${currency}: ${balance}`;
function createUserLookup(users) {
    return (id) => {
        const user = users.find(candidate => candidate.id === id);
        if (!user) {
            return { success: false, error: "Usuario nao encontrado." };
        }
        return { success: true, data: { id: user.id, name: user.name } };
    };
}
const profileUpdate = { bio: "Estudando type aliases" };
const userWithProfile = {
    ...rincko,
    profile: { userId: rincko.id, role: "member", ...profileUpdate },
};
const creditEntry = ["credits", rincko.wallet.credits];
console.log("Perfil:", userWithProfile.profile);
console.log("Saldo formatado:", formatBalance(creditEntry));
const findUser = createUserLookup([userWithProfile]);
for (const id of [rincko.id, "inexistente"]) {
    const result = findUser(id);
    if (result.success) {
        // O TypeScript reconhece data somente no caso de sucesso.
        console.log("Usuario encontrado:", result.data);
    }
    else {
        console.log("Falha na busca:", result.error);
    }
}
export {};
