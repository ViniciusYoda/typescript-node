// Tipos primitivos
const myName: string = "Vini";
const age: number = 25;
const isActive: boolean = true;

// Arrays: todos os elementos devem ter o tipo indicado.
const scores: number[] = [7, 8, 10];
const languages: string[] = ["JavaScript", "TypeScript"];

// Union: aceita mais de um tipo.
const userId: string | number = "user-1";

// Os parametros e o retorno da funcao recebem tipos.
function sum(a: number, b: number): number {
    return a + b;
}

console.log({ myName, age, isActive, scores, languages, userId });

// Uma interface descreve o formato de um objeto.
interface UserWallet {
    coins: number;
    credits: number;
}

// readonly impede a reatribuicao da propriedade pelo TypeScript.
interface Entity {
    readonly id: string;
    readonly createdAt: Date;
}

// extends permite reutilizar as propriedades de outra interface.
interface User extends Entity {
    name: string;
    email?: string; // Propriedade opcional.
    wallet: UserWallet;
    talk(message: string): void;
}

// A entrada de criacao nao precisa conter os campos gerados pelo sistema.
interface CreateUserInput {
    name: string;
    email?: string;
}

interface UpdateUserInput {
    name?: string;
    email?: string;
}

type WalletCurrency = keyof UserWallet; // "coins" | "credits"
type TransactionKind = "deposit" | "withdraw";

interface WalletTransaction extends Entity {
    readonly userId: string;
    readonly currency: WalletCurrency;
    readonly kind: TransactionKind;
    readonly amount: number;
    readonly balanceAfter: number;
}

// Uma interface generica pode representar resultados de tipos diferentes.
interface OperationResult<T> {
    data: T;
    message: string;
}

// Interfaces tambem descrevem contratos de servicos e seus metodos.
interface WalletService {
    deposit(user: User, currency: WalletCurrency, amount: number): OperationResult<WalletTransaction>;
    withdraw(user: User, currency: WalletCurrency, amount: number): OperationResult<WalletTransaction>;
    history(userId: string): readonly WalletTransaction[];
}

function validateName(name: string): string {
    const trimmedName = name.trim();
    if (!trimmedName) {
        throw new Error("O nome nao pode ficar vazio.");
    }
    return trimmedName;
}

function createUser(input: CreateUserInput): User {
    return {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        name: validateName(input.name),
        ...(input.email !== undefined ? { email: input.email } : {}),
        wallet: { coins: 0, credits: 0 },
        talk(message: string): void {
            console.log(`${this.name}: ${message}`);
        },
    };
}

function updateUser(user: User, input: UpdateUserInput): void {
    if (input.name !== undefined) {
        user.name = validateName(input.name);
    }
    if (input.email !== undefined) {
        user.email = input.email;
    }
}

function createWalletService(): WalletService {
    const transactions: WalletTransaction[] = [];

    function transact(
        user: User,
        currency: WalletCurrency,
        amount: number,
        kind: TransactionKind,
    ): OperationResult<WalletTransaction> {
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

        const transaction: WalletTransaction = {
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
const rincko: User = createUser({ name: myName });
const walletService: WalletService = createWalletService();

updateUser(rincko, { email: "vini@example.com" });
rincko.talk("Aprendendo interfaces com TypeScript!");

console.log(walletService.deposit(rincko, "credits", 100));
console.log(walletService.withdraw(rincko, "credits", 30));
console.log(walletService.deposit(rincko, "coins", 10));
console.log("Carteira:", rincko.wallet);
console.log("Historico:", walletService.history(rincko.id));

try {
    walletService.withdraw(rincko, "credits", 200);
} catch (error: unknown) {
    console.log(error instanceof Error ? error.message : "Erro desconhecido.");
}

// TYPE ALIAS: da um nome a um tipo; nao cria validacao em tempo de execucao.
type UserId = string;
type UserRole = "admin" | "member";

// Objetos tambem podem ser descritos com type.
type UserProfile = {
    readonly userId: UserId;
    role: UserRole;
    bio?: string;
};

// Intersecao (&): combina os membros de tipos, inclusive interfaces.
type UserWithProfile = User & { profile: UserProfile };

// Tupla: define o tipo e a posicao de cada elemento.
type WalletEntry = readonly [currency: WalletCurrency, balance: number];

// Alias para a assinatura de uma funcao.
type FormatBalance = (entry: WalletEntry) => string;
const formatBalance: FormatBalance = ([currency, balance]) => `${currency}: ${balance}`;

// Tipos utilitarios permitem derivar tipos existentes.
type UserSummary = Pick<User, "id" | "name">;
type ProfileUpdate = Partial<Omit<UserProfile, "userId">>;

// Uniao discriminada: o campo success indica quais propriedades existem.
type Result<T> =
    | { success: true; data: T }
    | { success: false; error: string };

type UserLookup = (id: UserId) => Result<UserSummary>;

function createUserLookup(users: readonly User[]): UserLookup {
    return (id) => {
        const user = users.find(candidate => candidate.id === id);
        if (!user) {
            return { success: false, error: "Usuario nao encontrado." };
        }
        return { success: true, data: { id: user.id, name: user.name } };
    };
}

const profileUpdate: ProfileUpdate = { bio: "Estudando type aliases" };
const userWithProfile: UserWithProfile = {
    ...rincko,
    profile: { userId: rincko.id, role: "member", ...profileUpdate },
};
const creditEntry: WalletEntry = ["credits", rincko.wallet.credits];

console.log("Perfil:", userWithProfile.profile);
console.log("Saldo formatado:", formatBalance(creditEntry));

const findUser: UserLookup = createUserLookup([userWithProfile]);
for (const id of [rincko.id, "inexistente"]) {
    const result = findUser(id);
    if (result.success) {
        // O TypeScript reconhece data somente no caso de sucesso.
        console.log("Usuario encontrado:", result.data);
    } else {
        console.log("Falha na busca:", result.error);
    }
}
