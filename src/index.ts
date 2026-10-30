import type { StudyRuntimeOptions } from "./study-runtime.js";
import buildAliasLesson, { formatLesson as formatImportedLesson, moduleName as lessonModuleName } from "./import-alias.js";
import type { LessonInfo as ImportedLessonInfo } from "./import-alias.js";
import * as LessonModule from "./import-alias.js";

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

// INTERSECTION TYPES: & exige que o valor atenda a todos os tipos combinados.
// Diferente da union (A | B), a intersecao (A & B) exige A e B ao mesmo tempo.
type Identifiable = {
    readonly id: string;
};

type Profile = {
    name: string;
    email: string;
};

type Permissions = {
    role: "admin" | "member";
    permissions: readonly string[];
};

// Compoe um novo tipo sem repetir as propriedades dos tipos originais.
export type AdminUser = Identifiable & Profile & Permissions;

const admin: AdminUser = {
    id: "admin-1",
    name: "Vini",
    email: "vini@example.com",
    role: "admin",
    permissions: ["users:read", "users:write"],
};

function describeAdmin(user: AdminUser): string {
    return `${user.name} (${user.id}): ${user.permissions.join(", ")}`;
}

// Interfaces tambem podem participar de uma intersecao.
interface Timestamped {
    readonly createdAt: Date;
}

type AuditEntry = Identifiable & Timestamped & { action: string };

const auditEntry: AuditEntry = {
    id: "audit-1",
    createdAt: new Date(),
    action: "Usuario administrador criado",
};

// Um alias generico permite reutilizar a composicao com outros objetos.
export type WithMetadata<T> = T & Timestamped;

const profile: WithMetadata<Profile> = {
    name: "Ana",
    email: "ana@example.com",
    createdAt: new Date(),
};

// Propriedades compartilhadas precisam satisfazer os dois tipos.
type Status = { status: "active" | "inactive" };
type ActiveStatus = Status & { status: "active" | "pending" };
const activeStatus: ActiveStatus = { status: "active" };

// Um conflito nao vira union: string & number resulta em never.
type ConflictingId = { id: string } & { id: number };
// ConflictingId["id"] e never: nenhum id comum satisfaz os dois tipos.
// const invalid: ConflictingId = { id: "user-1" }; // Erro de compilacao.
export type ImpossibleId = ConflictingId["id"];

// & descreve requisitos de tipos; nao mescla objetos em tempo de execucao.
// Para combinar valores, usamos o spread normalmente.
const identity: Identifiable = { id: "member-1" };
const member: Identifiable & Profile = { ...identity, ...profile };

console.log("Administrador:", describeAdmin(admin));
console.log("Auditoria:", auditEntry);
console.log("Perfil com data de criacao:", profile);
console.log("Status compartilhado:", activeStatus);
console.log("Membro composto:", member);

// UNION TYPES: | permite que um valor corresponda a uma das alternativas.
type SearchId = string | number;

function formatSearchId(id: SearchId): string {
    // Narrowing: typeof restringe o tipo dentro de cada caminho.
    // Antes da verificacao, id.toUpperCase() seria um erro: number nao tem esse metodo.
    if (typeof id === "string") {
        return id.toUpperCase();
    }
    return id.toFixed(0);
}

console.log("ID textual:", formatSearchId("user-1"));
console.log("ID numerico:", formatSearchId(42));

// Unions de literais limitam os valores aceitos.
type NotificationChannel = "email" | "sms" | "push";

function notify(channel: NotificationChannel, message: string): void {
    console.log(`Notificacao por ${channel}: ${message}`);
}

notify("email", "Seu deposito foi confirmado.");
// notify("fax", "Ola"); // Erro: "fax" nao pertence a NotificationChannel.

// null tambem pode ser uma alternativa e precisa ser tratado.
function findProfile(name: string): Profile | null {
    return profile.name === name ? profile : null;
}

for (const name of ["Ana", "Bruno"]) {
    const foundProfile = findProfile(name);
    if (foundProfile === null) {
        console.log("Perfil nao encontrado:", name);
    } else {
        console.log("Email encontrado:", foundProfile.email);
    }
}

// Uniao discriminada: cada variante tem um literal exclusivo em kind.
// Assim, cada operacao carrega somente os dados de que precisa.
type WalletCommand =
    | { kind: "deposit"; currency: WalletCurrency; amount: number }
    | { kind: "withdraw"; currency: WalletCurrency; amount: number }
    | { kind: "history" };

function assertNever(value: never): never {
    throw new Error(`Comando nao tratado: ${JSON.stringify(value)}`);
}

function executeWalletCommand(user: User, command: WalletCommand): void {
    switch (command.kind) {
        case "deposit":
            console.log(walletService.deposit(user, command.currency, command.amount));
            return;
        case "withdraw":
            console.log(walletService.withdraw(user, command.currency, command.amount));
            return;
        case "history":
            // Aqui command nao tem amount nem currency.
            console.log("Historico por comando:", walletService.history(user.id));
            return;
        default:
            // Se adicionarmos uma variante sem tratar acima, o compilador acusa aqui.
            assertNever(command);
    }
}

// O array aceita variantes diferentes da mesma union.
const commands: WalletCommand[] = [
    { kind: "deposit", currency: "credits", amount: 20 },
    { kind: "withdraw", currency: "credits", amount: 5 },
    { kind: "history" },
];

for (const command of commands) {
    executeWalletCommand(rincko, command);
}

// TIPAGEM DE FUNCOES: os parametros e o retorno fazem parte do contrato.
function calculateTotal(price: number, quantity: number): number {
    return price * quantity;
}

// O retorno tambem pode ser inferido pelo TypeScript.
const applyDiscount = (total: number, discount: number) => total * (1 - discount);

// Parametro opcional: dentro da funcao, suffix pode ser string ou undefined.
function greetUser(name: string, suffix?: string): string {
    return suffix === undefined ? `Ola, ${name}!` : `Ola, ${name} ${suffix}!`;
}

// Parametro com valor padrao: pode ser omitido na chamada.
function calculateFee(amount: number, rate: number = 0.05): number {
    return amount * rate;
}

// Rest parameters: cada argumento adicional precisa ser number.
function sumAmounts(...amounts: number[]): number {
    return amounts.reduce((total, amount) => total + amount, 0);
}

// Um alias descreve a assinatura de uma funcao, sem implementa-la.
type BinaryOperation = (left: number, right: number) => number;
const multiply: BinaryOperation = (left, right) => left * right;

// Callbacks tambem recebem tipos. Aqui a funcao e passada como argumento.
function calculate(left: number, right: number, operation: BinaryOperation): number {
    return operation(left, right);
}

// void indica que quem chama nao deve usar um valor de retorno.
type MessageLogger = (message: string) => void;
const logMessage: MessageLogger = message => {
    console.log("Mensagem:", message);
};

// Genericos preservam a relacao entre os tipos de entrada e de saida.
// Com noUncheckedIndexedAccess desligado, explicitamos undefined para arrays vazios.
function firstItem<T>(items: readonly T[]): T | undefined {
    return items[0];
}

// Sobrecargas relacionam cada formato de entrada ao seu retorno.
function formatValue(value: number): string;
function formatValue(value: readonly number[]): string[];
function formatValue(value: number | readonly number[]): string | string[] {
    if (typeof value === "number") {
        return value.toFixed(2);
    }
    return value.map(item => item.toFixed(2));
}

// Funcoes async sempre retornam uma Promise.
async function loadUserSummary(user: User): Promise<UserSummary> {
    return { id: user.id, name: user.name };
}

const purchaseTotal: number = calculateTotal(25, 3);
console.log("Total da compra:", purchaseTotal);
console.log("Com desconto:", applyDiscount(purchaseTotal, 0.1));
console.log(greetUser("Vini"));
console.log(greetUser("Ana", "Silva"));
console.log("Taxa padrao:", calculateFee(100));
console.log("Taxa personalizada:", calculateFee(100, 0.02));
console.log("Soma de valores:", sumAmounts(10, 20, 30));
console.log("Callback nomeado:", calculate(4, 5, multiply));
console.log("Callback inline:", calculate(10, 2, (left, right) => left / right));
logMessage("Aprendendo tipagem de funcoes!");
console.log("Primeiro nome:", firstItem(["Ana", "Vini"]));
console.log("Lista vazia:", firstItem<number>([]));

// As sobrecargas permitem inferir string e string[], respectivamente.
const formattedValue: string = formatValue(10);
const formattedValues: string[] = formatValue([10, 20]);
console.log("Valor formatado:", formattedValue);
console.log("Valores formatados:", formattedValues);
console.log("Resumo assincrono:", await loadUserSummary(rincko));

// Exemplos invalidos (descomente para ver os erros de tipagem):
// calculateTotal("25", 3); // O primeiro parametro exige number.
// const invalidOperation: BinaryOperation = (left, right) => `${left + right}`;
// formatValue("10"); // Nenhuma sobrecarga aceita string.

// CLASSES: definem a estrutura e o comportamento de objetos em tempo de execucao.
interface AccountOperations {
    deposit(amount: number): void;
    withdraw(amount: number): void;
}

// abstract permite compartilhar implementacao, mas impede new Account(...).
abstract class Account implements AccountOperations {
    // static pertence a classe, e nao a cada instancia.
    static readonly currency = "BRL";

    // private restringe o acesso pelo TypeScript ao interior desta classe.
    private currentBalance: number = 0;

    // Parameter properties declaram e inicializam propriedades no construtor.
    // readonly impede reatribuicao pelo TypeScript depois da inicializacao.
    constructor(
        public readonly accountId: string,
        protected ownerName: string,
    ) {
        this.renameOwner(ownerName);
    }

    // Getter: permite ler o saldo sem expor uma atribuicao direta.
    get balance(): number {
        return this.currentBalance;
    }

    get owner(): string {
        return this.ownerName;
    }

    renameOwner(name: string): void {
        const trimmedName = name.trim();
        if (!trimmedName) {
            throw new Error("O titular nao pode ficar vazio.");
        }
        this.ownerName = trimmedName;
    }

    deposit(amount: number): void {
        this.validateAmount(amount);
        const nextBalance = this.currentBalance + amount;
        if (!Number.isSafeInteger(nextBalance)) {
            throw new Error("O saldo ultrapassa o limite permitido.");
        }
        this.currentBalance = nextBalance;
    }

    withdraw(amount: number): void {
        this.validateAmount(amount);
        if (amount > this.currentBalance) {
            throw new Error("Saldo insuficiente na conta.");
        }
        this.currentBalance -= amount;
    }

    // protected permite reutilizar o metodo nas subclasses.
    protected validateAmount(amount: number): void {
        // Valores monetarios em centavos evitam fracionamento neste exemplo.
        if (!Number.isSafeInteger(amount) || amount <= 0) {
            throw new Error("O valor deve ser um inteiro positivo de centavos.");
        }
    }

    // Cada subclasse concreta precisa implementar este metodo.
    abstract describe(): string;
}

// extends herda os membros e o comportamento da classe base.
class SavingsAccount extends Account {
    constructor(accountId: string, ownerName: string, public readonly bankName: string) {
        // super inicializa a classe base antes de acessar this.
        super(accountId, ownerName);
    }

    override describe(): string {
        // ownerName e protected: esta disponivel dentro da subclasse.
        return `Poupanca de ${this.ownerName} no banco ${this.bankName}`;
    }

    creditInterest(amount: number): void {
        this.deposit(amount);
    }
}

class CheckingAccount extends Account {
    override describe(): string {
        return `Conta corrente de ${this.ownerName}`;
    }
}

const savingsAccount = new SavingsAccount("savings-1", "Vini", "Banco Exemplo");
savingsAccount.deposit(10_000);
savingsAccount.withdraw(2_000);
savingsAccount.creditInterest(100);
savingsAccount.renameOwner("Vinicius");

console.log("Titular:", savingsAccount.owner);
console.log("Saldo em centavos:", savingsAccount.balance);
console.log("Moeda da classe:", Account.currency);
console.log("Instancia de Account:", savingsAccount instanceof Account);

const checkingAccount = new CheckingAccount("checking-1", "Ana");
checkingAccount.deposit(5_000);

// Polimorfismo: o mesmo contrato chama a implementacao de cada subclasse.
const accounts: Account[] = [savingsAccount, checkingAccount];
for (const account of accounts) {
    console.log(account.describe(), "- saldo em centavos:", account.balance);
}

try {
    checkingAccount.withdraw(6_000);
} catch (error: unknown) {
    console.log(error instanceof Error ? error.message : "Erro desconhecido.");
}

// Restricoes verificadas pelo compilador (descomente para estudar):
// new Account("account-1", "Vini"); // Classe abstrata nao pode ser instanciada.
// savingsAccount.currentBalance = 0; // Propriedade private.
// savingsAccount.ownerName = "Ana"; // Propriedade protected.
// savingsAccount.accountId = "outro-id"; // Propriedade readonly.
// savingsAccount.balance = 0; // Getter sem setter.
// private e readonly sao restricoes do TypeScript; nao validam dados externos.

// OVERLOAD: uma funcao pode oferecer diferentes assinaturas de chamada.
// As assinaturas publicas ficam juntas e antes da unica implementacao.
function lookupUser(id: string): UserSummary | undefined;
function lookupUser(ids: readonly string[]): UserSummary[];
function lookupUser(input: string | readonly string[]): UserSummary | UserSummary[] | undefined {
    const users: readonly UserSummary[] = [
        { id: rincko.id, name: rincko.name },
        { id: "user-ana", name: "Ana" },
    ];

    if (typeof input === "string") {
        return users.find(user => user.id === input);
    }

    return users.filter(user => input.includes(user.id));
}

// Cada chamada recebe um retorno especifico, sem precisar de uma assercao "as".
const singleUser = lookupUser(rincko.id); // UserSummary | undefined
const multipleUsers = lookupUser([rincko.id, "user-ana"]); // UserSummary[]
console.log("Busca individual com overload:", singleUser?.name ?? "Nao encontrado");
console.log("Busca em lote com overload:", multipleUsers.map(user => user.name));
console.log("Busca individual ausente:", lookupUser("inexistente"));

// Overloads tambem podem restringir a quantidade de argumentos.
// Aqui sao aceitos um argumento (timestamp) OU tres (ano, mes e dia).
function createDate(timestamp: number): Date;
function createDate(year: number, month: number, day: number): Date;
function createDate(timestampOrYear: number, month?: number, day?: number): Date {
    if (month !== undefined && day !== undefined) {
        // O mes recebido usa 1 a 12; o construtor Date usa 0 a 11.
        return new Date(timestampOrYear, month - 1, day);
    }
    return new Date(timestampOrYear);
}

console.log("Data por timestamp:", createDate(0).toISOString());
console.log("Data por componentes:", createDate(2026, 10, 30).toLocaleDateString("pt-BR"));
// createDate(2026, 10); // Erro: nenhuma assinatura publica aceita dois argumentos.
// A assinatura da implementacao nao fica disponivel para quem chama a funcao.

// A ordem importa quando assinaturas se sobrepoem: coloque a mais especifica antes.
function parseSetting(value: "true" | "false"): boolean;
function parseSetting(value: string): boolean | string;
function parseSetting(value: string): boolean | string {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
}

const enabledSetting: boolean = parseSetting("true");
// Uma string cujo conteudo e desconhecido tambem pode conter "true" ou "false".
// Por isso, a assinatura ampla precisa refletir todos os retornos possiveis.
console.log("Configuracao literal:", enabledSetting);
const rawSetting: string = String("false");
const parsedSetting: boolean | string = parseSetting(rawSetting);
console.log("Configuracao dinamica:", parsedSetting);

// Use union quando as entradas compartilham o mesmo retorno e comportamento.
function displayIdentifier(id: string | number): string {
    return String(id);
}

const mixedIdentifier: string | number = Math.random() > 0.5 ? "user-1" : 42;
console.log("Identificador com union:", displayIdentifier(mixedIdentifier));

// Uma entrada union exige uma assinatura publica que aceite a union completa.
// lookupUser(Math.random() > 0.5 ? rincko.id : [rincko.id]);
// Erro: nenhuma das duas sobrecargas aceita string | string[].
// lookupUser(123); // Erro: nenhuma sobrecarga aceita number.

// TYPE GUARDS: verificacoes em tempo de execucao que restringem um tipo.
function describeInput(value: string | number | Date): string {
    if (typeof value === "string") {
        return `Texto: ${value.trim()}`;
    }
    if (value instanceof Date) {
        return `Data: ${value.toISOString()}`;
    }
    // As outras alternativas foram eliminadas: aqui value e number.
    return `Numero: ${value.toFixed(2)}`;
}

console.log(describeInput(" TypeScript "));
console.log(describeInput(42));
console.log(describeInput(new Date("2026-10-30T12:00:00Z")));

// in verifica a existencia de uma propriedade e pode distinguir objetos tipados.
type EmailContact = { email: string };
type PhoneContact = { phone: string };

function describeContact(contact: EmailContact | PhoneContact): string {
    if ("email" in contact) {
        return `Email: ${contact.email}`;
    }
    return `Telefone: ${contact.phone}`;
}

console.log(describeContact({ email: "ana@example.com" }));
console.log(describeContact({ phone: "11999990000" }));

// Predicado "value is Profile": informa qual tipo foi verificado no retorno true.
// unknown exige verificar os dados antes de acessar suas propriedades.
function isProfile(value: unknown): value is Profile {
    // typeof null e "object", por isso null precisa ser descartado explicitamente.
    if (typeof value !== "object" || value === null) {
        return false;
    }
    return "name" in value && typeof value.name === "string"
        && "email" in value && typeof value.email === "string";
}

// O compilador confia no predicado: a implementacao deve validar todo o contrato.
// Este guard verifica o formato; nao verifica se o email e um endereco valido.
const receivedProfiles: unknown[] = [
    { name: "Ana", email: "ana@example.com" },
    { name: "Vini", email: "vini@example.com" },
    { name: "Sem email" },
    { name: 123, email: "invalid@example.com" },
    null,
];

// filter usa o predicado para produzir Profile[], sem assercoes com "as".
const validProfiles: Profile[] = receivedProfiles.filter(isProfile);
console.log("Perfis validados:", validProfiles.map(item => item.name));

function printReceivedProfile(value: unknown): void {
    if (!isProfile(value)) {
        console.log("Perfil recebido com formato invalido.");
        return;
    }
    // O retorno antecipado garante que value e Profile neste ponto.
    console.log("Perfil recebido:", value.name, value.email);
}

printReceivedProfile({ name: "Bruno", email: "bruno@example.com" });
printReceivedProfile({ name: "Incompleto" });

// asserts restringe o tipo apos a chamada; dados invalidos precisam causar erro.
function assertProfile(value: unknown): asserts value is Profile {
    if (!isProfile(value)) {
        throw new Error("O valor precisa conter name e email do tipo string.");
    }
}

const externalProfile: unknown = { name: "Carla", email: "carla@example.com" };
assertProfile(externalProfile);
console.log("Perfil apos assercao:", externalProfile.email);

try {
    assertProfile({ name: "Perfil invalido" });
} catch (error: unknown) {
    // instanceof tambem restringe unknown no tratamento de erros.
    console.log(error instanceof Error ? error.message : "Erro desconhecido.");
}

// Evite usar apenas if (value) quando 0 ou "" forem valores validos.
function printOptionalBalance(balance: number | null | undefined): void {
    if (balance === null || balance === undefined) {
        console.log("Saldo nao informado.");
        return;
    }
    console.log("Saldo informado:", balance.toFixed(2));
}

printOptionalBalance(0);
printOptionalBalance(undefined);

// NARROWING (REFINAMENTO): o compilador reduz as alternativas de um tipo
// conforme analisa as verificacoes e os caminhos possiveis do codigo.
// Type guards sao verificacoes; narrowing e o refinamento que elas permitem.
function normalizeSearch(value: string | number | null): string {
    if (value === null) {
        return "Sem filtro";
    }
    // O retorno acima elimina null de todos os caminhos que chegam aqui.
    if (typeof value === "number") {
        return `Codigo: ${value.toFixed(0)}`;
    }
    // Agora resta apenas string, sem precisar de uma assercao "as".
    return `Nome: ${value.trim().toLowerCase()}`;
}

console.log("Filtro nulo:", normalizeSearch(null));
console.log("Filtro numerico:", normalizeSearch(42));
console.log("Filtro textual:", normalizeSearch(" ANA "));

// Igualdade entre valores tambem refina os tipos das duas variaveis.
function compareValues(left: string | number, right: string | boolean): string {
    if (left === right) {
        // O unico tipo compartilhado pelas duas unions e string.
        return `Textos iguais: ${left.toUpperCase()} / ${right.toUpperCase()}`;
    }
    return `Valores diferentes: ${left} / ${right}`;
}

console.log(compareValues("ana", "ana"));
console.log(compareValues(42, false));

// != null descarta null E undefined, mas preserva 0 e strings vazias.
function describeOptionalText(text: string | null | undefined): string {
    if (text != null) {
        return `Texto informado com ${text.length} caracteres`;
    }
    return "Texto ausente";
}

console.log(describeOptionalText(""));
console.log(describeOptionalText(null));
console.log(describeOptionalText(undefined));

// O discriminante conecta cada estado aos dados que realmente existem nele.
type ProfileLoadState =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success"; profile: Profile }
    | { status: "error"; message: string };

function describeProfileState(state: ProfileLoadState): string {
    switch (state.status) {
        case "idle":
            return "Aguardando busca do perfil";
        case "loading":
            return "Carregando perfil";
        case "success":
            return `Perfil carregado: ${state.profile.name}`;
        case "error":
            return `Falha ao carregar: ${state.message}`;
        default:
            // Depois de tratar todas as variantes, state e never.
            return assertNever(state);
    }
}

const profileStates: ProfileLoadState[] = [
    { status: "idle" },
    { status: "loading" },
    { status: "success", profile },
    { status: "error", message: "Perfil indisponivel" },
];

for (const state of profileStates) {
    console.log(describeProfileState(state));
}

// Uma atribuicao pode alterar o tipo refinado, respeitando o tipo declarado.
function demonstrateAssignment(initialValue: string | number): void {
    let value: string | number = initialValue;
    if (typeof value === "string") {
        console.log("Antes da atribuicao:", value.toUpperCase());
        value = value.length;
        // Apos receber um numero, value foi refinado para number.
        console.log("Depois da atribuicao:", value.toFixed(0));
        // value.toUpperCase(); // Erro: o refinamento anterior nao vale mais.
    }
    // Neste ponto, todos os caminhos resultam em number.
    console.log("Resultado do fluxo:", value.toFixed(0));
    // value = true; // Erro: boolean nao pertence ao tipo declarado.
}

demonstrateAssignment("TypeScript");
demonstrateAssignment(25);

// TIPOS GENERICOS: parametros de tipo preservam a relacao entre os valores.
// Diferente de any, T mantem a verificacao do tipo recebido e retornado.
function identityValue<T>(value: T): T {
    return value;
}

const genericName = identityValue("Ana"); // Tipo inferido a partir do argumento.
const genericNumber = identityValue<number>(42); // Tipo informado explicitamente.
console.log("Identidade generica:", genericName.toUpperCase(), genericNumber.toFixed(2));

// Dois parametros de tipo relacionam uma entrada a uma saida diferente.
function mapItems<TInput, TOutput>(
    items: readonly TInput[],
    transform: (item: TInput) => TOutput,
): TOutput[] {
    return items.map(transform);
}

const profileNames: string[] = mapItems(validProfiles, item => item.name);
const nameLengths: number[] = mapItems(profileNames, name => name.length);
console.log("Mapeamento generico:", profileNames, nameLengths);

// extends restringe quais tipos podem ser usados, sem perder o tipo concreto.
function describeEntity<T extends Identifiable>(entity: T): T {
    console.log("Entidade generica:", entity.id);
    return entity;
}

const describedAdmin = describeEntity(admin);
console.log("Propriedade preservada:", describedAdmin.permissions);
// describeEntity({ name: "Sem ID" }); // Erro: falta a propriedade id.

// keyof conecta uma chave ao tipo do objeto; T[K] representa o valor dessa chave.
function getProperty<T extends object, K extends keyof T>(object: T, key: K): T[K] {
    return object[key];
}

const selectedName: string = getProperty(profile, "name");
const selectedDate: Date = getProperty(profile, "createdAt");
console.log("Propriedades genericas:", selectedName, selectedDate.toISOString());
// getProperty(profile, "balance"); // Erro: esta chave nao existe em profile.

// Interfaces genericas reutilizam um formato com diferentes tipos de dados.
// O tipo padrao e usado quando o parametro e omitido.
interface DataPage<T = UserSummary> {
    items: readonly T[];
    total: number;
}

const userPage: DataPage = {
    items: [{ id: rincko.id, name: rincko.name }],
    total: 1,
};
const numberPage: DataPage<number> = { items: [10, 20, 30], total: 3 };
console.log("Paginas genericas:", userPage, numberPage);

// Cada instancia da classe fixa o tipo dos itens que pode armazenar.
class InMemoryRepository<T extends Identifiable> {
    private readonly items = new Map<string, T>();

    save(item: T): void {
        this.items.set(item.id, item);
    }

    findById(id: string): T | undefined {
        return this.items.get(id);
    }

    findAll(): T[] {
        return [...this.items.values()];
    }
}

const adminRepository = new InMemoryRepository<AdminUser>();
adminRepository.save(admin);
const storedAdmin = adminRepository.findById(admin.id);
console.log("Admin armazenado:", storedAdmin?.permissions);
console.log("Admin ausente:", adminRepository.findById("inexistente"));
console.log("Todos os admins:", adminRepository.findAll());
// adminRepository.save({ id: "incompleto" }); // Erro: faltam os membros de AdminUser.

const auditRepository = new InMemoryRepository<AuditEntry>();
auditRepository.save(auditEntry);
console.log("Auditoria armazenada:", auditRepository.findById(auditEntry.id)?.action);

// Os parametros genericos desaparecem na compilacao: nao validam dados externos.
// Para dados unknown, continue usando uma verificacao real, como isProfile.

// RECORD<K, V>: descreve um objeto com chaves K e valores do tipo V.
// K pode ser uma union de strings, numeros ou symbols.
type RoleLabels = Record<UserRole, string>;

// Uma union finita de chaves exige que todas estejam presentes.
const roleLabels: RoleLabels = {
    admin: "Administrador",
    member: "Membro",
};
console.log("Rotulo do papel:", roleLabels[admin.role]);
// const missingRole: RoleLabels = { admin: "Administrador" }; // Falta member.
// const invalidLabel: RoleLabels = { admin: 123, member: "Membro" }; // Valor invalido.

// Record tambem pode usar um objeto como tipo dos valores.
type CurrencyDetails = {
    label: string;
    symbol: string;
};

const currencyDetails: Record<WalletCurrency, CurrencyDetails> = {
    coins: { label: "Moedas", symbol: "MO" },
    credits: { label: "Creditos", symbol: "CR" },
};

function describeCurrency(currency: WalletCurrency, balance: number): string {
    const details = currencyDetails[currency];
    return `${details.label}: ${balance} ${details.symbol}`;
}

console.log(describeCurrency("coins", rincko.wallet.coins));
console.log(describeCurrency("credits", rincko.wallet.credits));

// Partial torna opcionais as chaves de um Record com conjunto finito.
type WalletLimits = Partial<Record<WalletCurrency, number>>;
const walletLimits: WalletLimits = { credits: 1_000 };

function describeLimit(currency: WalletCurrency): string {
    const limit = walletLimits[currency]; // number | undefined
    return limit === undefined ? "Limite nao configurado" : `Limite: ${limit}`;
}

console.log("Limite de moedas:", describeLimit("coins"));
console.log("Limite de creditos:", describeLimit("credits"));

// Readonly impede a reatribuicao das propriedades pelo TypeScript.
const rolePermissions: Readonly<Record<UserRole, readonly string[]>> = {
    admin: ["users:read", "users:write"],
    member: ["profile:read"],
};
console.log("Permissoes por papel:", rolePermissions.member);
// rolePermissions.member = []; // Erro: propriedade readonly.
// rolePermissions.member.push("users:write"); // Erro: array readonly.

// Com chaves abertas (string), o objeto nao contem todas as strings possiveis.
// Explicitamos undefined para acessos ausentes, mesmo sem noUncheckedIndexedAccess.
const profilesById: Record<string, Profile | undefined> = {
    "user-ana": { name: "Ana", email: "ana@example.com" },
};

function printProfileById(id: string): void {
    // hasOwn evita tratar propriedades herdadas, como toString, como registros.
    const storedProfile = Object.hasOwn(profilesById, id) ? profilesById[id] : undefined;
    if (storedProfile === undefined) {
        console.log("Perfil ausente no dicionario:", id);
        return;
    }
    console.log("Perfil no dicionario:", storedProfile.name);
}

printProfileById("user-ana");
printProfileById("inexistente");
printProfileById("toString");

// satisfies confere o contrato sem substituir o tipo inferido da expressao.
// as const preserva os valores literais e torna as propriedades readonly.
const transactionLabels = {
    deposit: "Deposito",
    withdraw: "Saque",
} as const satisfies Record<TransactionKind, string>;

const depositLabel: "Deposito" = transactionLabels.deposit;
console.log("Rotulo literal preservado:", depositLabel);

// Record e um tipo: nao cria objetos nem valida dados em tempo de execucao.
// Para adicionar/remover entradas dinamicamente, Map tambem pode ser apropriado.

// ANOTACAO, AS E SATISFIES: tres maneiras de trabalhar com tipos, com efeitos diferentes.
type ColorValue = string | readonly [red: number, green: number, blue: number];
type ColorPalette = Record<"primary" | "secondary", ColorValue>;

// Anotacao (: Tipo): verifica o valor e define o tipo da variavel como ColorPalette.
const annotatedPalette: ColorPalette = {
    primary: "#3366ff",
    secondary: [255, 128, 0],
};

// Mesmo inicializada com string, a propriedade e lida como ColorValue.
// annotatedPalette.primary.toUpperCase(); // Erro: a alternativa tupla nao tem esse metodo.
if (typeof annotatedPalette.primary === "string") {
    console.log("Paleta com anotacao:", annotatedPalette.primary.toUpperCase());
}

// satisfies verifica o contrato e preserva um tipo mais especifico da expressao.
// O contrato ainda participa da inferencia contextual, como na tupla abaixo.
const checkedPalette = {
    primary: "#3366ff",
    secondary: [255, 128, 0],
} satisfies ColorPalette;

console.log("Paleta com satisfies:", checkedPalette.primary.toUpperCase());
console.log("Canal vermelho:", checkedPalette.secondary[0].toFixed(0));
// satisfies sozinho nao congela o objeto nem preserva todos os literais.
checkedPalette.primary = "#112233";
// checkedPalette.primary = [0, 0, 0]; // Erro: a propriedade foi inferida como string.

// as e uma assercao: pede ao compilador para tratar o valor como outro tipo.
// Nao converte o valor nem verifica seu conteudo em tempo de execucao.
const assertedPalette = {
    primary: "#3366ff",
    secondary: [255, 128, 0],
} as ColorPalette;

// A assercao tambem faz a propriedade ser vista pelo tipo amplo ColorValue.
console.log("Paleta com as:", assertedPalette.primary);

// Uma assercao pode ocultar dados incompletos que anotacao e satisfies rejeitariam.
const incompleteProfile = { name: "Sem email" } as Profile;
// O compilador acredita em string, mas o valor real e undefined.
console.log("Email real apos assercao incompleta:", incompleteProfile.email);
// const rejectedProfile: Profile = { name: "Sem email" }; // Erro: falta email.
// const checkedProfile = { name: "Sem email" } satisfies Profile; // Mesmo erro.

// Prefira um guard para dados externos em vez de assumir seu formato com as.
const incomingProfile: unknown = { name: "Dora", email: "dora@example.com" };
if (isProfile(incomingProfile)) {
    console.log("Perfil realmente verificado:", incomingProfile.email.toLowerCase());
}

// Assercao nao e conversao: o valor continua sendo string em tempo de execucao.
const textAmount: unknown = "42";
const assertedAmount = textAmount as number;
const convertedAmount = Number(textAmount);
console.log("Tipo real apos as:", typeof assertedAmount); // string
console.log("Conversao com Number:", typeof convertedAmount, convertedAmount); // number

// as const preserva literais e aplica readonly aos membros literais do objeto.
// Com satisfies, tambem verificamos a estrutura exigida.
const fixedPalette = {
    primary: "#3366ff",
    secondary: [255, 128, 0],
} as const satisfies ColorPalette;

const primaryHex: "#3366ff" = fixedPalette.primary;
console.log("Literal preservado com as const:", primaryHex);
// fixedPalette.primary = "#112233"; // Erro: readonly.
// fixedPalette.secondary.push(10); // Erro: tupla readonly.
// as const nao executa Object.freeze: a restricao e verificada pelo TypeScript.

// Em literais de objeto, satisfies tambem detecta chaves extras e valores invalidos.
// const extraColor = { primary: "red", secondary: "blue", accent: "pink" } satisfies ColorPalette;
// const wrongColor = { primary: true, secondary: "blue" } satisfies ColorPalette;
// Use anotacao para expor um contrato, satisfies para conferir mantendo inferencia,
// e as quando houver uma garantia externa que o compilador nao consegue deduzir.

// TYPEOF: em uma expressao, retorna uma string com a categoria do valor.
console.log("typeof em execucao:", typeof "TypeScript", typeof 42, typeof true);
console.log("Casos especiais:", typeof null, typeof [], typeof (() => {}));
// null e arrays retornam "object"; use verificacao de null e Array.isArray.

// Em uma posicao de tipo, typeof obtem o tipo estatico de um valor existente.
const appSettings = {
    name: "Curso TypeScript",
    retryCount: 3,
    notificationsEnabled: true,
};

type AppSettings = typeof appSettings;
const customSettings: AppSettings = {
    name: "Ambiente de estudos",
    retryCount: 5,
    notificationsEnabled: false,
};
console.log("Configuracao derivada com typeof:", customSettings);
// const wrongSettings: AppSettings = { name: "App", retryCount: "3", notificationsEnabled: true };
// Erro: retryCount precisa ser number.

// keyof typeof extrai as chaves de um objeto como uma union de literais.
type SettingKey = keyof typeof appSettings;

function readSetting<K extends SettingKey>(key: K): AppSettings[K] {
    return appSettings[key];
}

const retryCount: number = readSetting("retryCount");
const applicationName: string = readSetting("name");
console.log("Configuracoes por chave:", applicationName, retryCount);
// readSetting("missing"); // Erro: a chave nao existe em appSettings.

// typeof preserva o tipo ja inferido: as const torna esta lista uma tupla literal.
const supportedEnvironments = ["development", "test", "production"] as const;
type Environment = (typeof supportedEnvironments)[number];
const currentEnvironment: Environment = "development";
console.log("Ambiente derivado da lista:", currentEnvironment);
// const invalidEnvironment: Environment = "staging"; // Erro: fora da union.

// Tambem podemos extrair os valores de um objeto com acesso indexado.
const httpCodes = {
    ok: 200,
    notFound: 404,
    serverError: 500,
} as const;
type HttpCode = (typeof httpCodes)[keyof typeof httpCodes]; // 200 | 404 | 500
const responseCode: HttpCode = 200;
console.log("Codigo HTTP literal:", responseCode);

// typeof em funcoes captura a assinatura, incluindo parametros e retorno.
function createNotification(recipient: string, message: string) {
    return { recipient, message, read: false };
}

type NotificationFactory = typeof createNotification;
const createWelcomeNotification: NotificationFactory = (recipient, message) => ({
    recipient,
    message: `Boas-vindas! ${message}`,
    read: false,
});

// Utilitarios podem trabalhar sobre a assinatura extraida.
type NotificationArguments = Parameters<typeof createNotification>;
type NotificationPayload = ReturnType<typeof createNotification>;
const notificationArguments: NotificationArguments = ["ana@example.com", "Vamos estudar typeof."];
const notificationPayload: NotificationPayload = createWelcomeNotification(...notificationArguments);
console.log("Notificacao derivada da funcao:", notificationPayload);

// No contexto de tipos, typeof referencia identificadores e suas propriedades.
// type InvalidNotification = typeof createNotification("Ana", "Ola"); // Chamada nao permitida.
// Use ReturnType<typeof createNotification> para obter o retorno.
// typeof nao valida dados externos e nao transforma valores em tempo de execucao.

// KEYOF: extrai as chaves de um tipo como uma union.
type Course = {
    title: string;
    lessons: number;
    published: boolean;
};
type CourseKey = keyof Course; // "title" | "lessons" | "published"

const course: Course = { title: "TypeScript", lessons: 12, published: false };
const courseKey: CourseKey = "title";
console.log("Chave do curso:", courseKey, course[courseKey]);
// const invalidCourseKey: CourseKey = "price"; // Erro: nao e uma chave de Course.

// keyof recebe um tipo; typeof permite partir de um valor existente.
type CourseValueKeys = keyof typeof course; // Mesmas chaves de Course.
const lessonKey: CourseValueKeys = "lessons";
console.log("Chave extraida do valor:", course[lessonKey]);

// T[K] conecta o tipo do valor a chave escolhida.
function setCourseProperty<K extends keyof Course>(target: Course, key: K, value: Course[K]): void {
    target[key] = value;
}

setCourseProperty(course, "lessons", 15);
setCourseProperty(course, "published", true);
// setCourseProperty(course, "lessons", "quinze"); // Erro: lessons exige number.
// setCourseProperty(course, "price", 100); // Erro: chave inexistente.
console.log("Curso atualizado por chave:", course);

// keyof tambem limita as chaves aceitas pelos tipos utilitarios.
type CourseSummary = Pick<Course, "title" | "published">;
const courseSummary: CourseSummary = { title: course.title, published: course.published };
console.log("Resumo com Pick:", courseSummary);

// Um tipo mapeado percorre cada chave para construir um novo formato.
type FieldLabels<T> = { [K in keyof T]: string };
const courseLabels: FieldLabels<Course> = {
    title: "Titulo",
    lessons: "Quantidade de aulas",
    published: "Publicado",
};
console.log("Rotulo de campo:", courseLabels.lessons);
// Se adicionarmos uma propriedade obrigatoria em Course, seu rotulo sera exigido aqui.

// keyof em unions inclui apenas chaves que existem em TODAS as alternativas.
type VideoLesson = { title: string; duration: number };
type TextLesson = { title: string; wordCount: number };
type SharedLessonKey = keyof (VideoLesson | TextLesson); // "title"
type CombinedLessonKey = keyof (VideoLesson & TextLesson); // "title" | "duration" | "wordCount"
const sharedLessonKey: SharedLessonKey = "title";
const combinedLessonKey: CombinedLessonKey = "duration";
console.log("Chaves de union e intersection:", sharedLessonKey, combinedLessonKey);

// Chaves nao precisam ser strings: numeros e symbols tambem sao permitidos.
const courseTag = Symbol("courseTag");
const keyedExample = { 0: "Primeiro", name: "Exemplo", [courseTag]: "curso" };
type ExampleKey = keyof typeof keyedExample; // 0 | "name" | typeof courseTag
const numericKey: ExampleKey = 0;
const symbolKey: ExampleKey = courseTag;
console.log("Chaves numerica e symbol:", keyedExample[numericKey], keyedExample[symbolKey]);

// Uma assinatura de indice string aceita tambem indices numericos em JavaScript.
type StringIndexedValues = { [key: string]: number };
type StringIndexedKey = keyof StringIndexedValues; // string | number
const indexedKey: StringIndexedKey = 42;
console.log("Chave de assinatura de indice:", indexedKey);

// Object.keys retorna string[]: os objetos podem ter propriedades extras em runtime.
// Uma anotacao mais estreita nao remove essas propriedades do objeto real.
const extendedCourse = { ...course, internalCode: "TS-01" };
const courseView: Course = extendedCourse;
console.log("Chaves reais do objeto:", Object.keys(courseView));
// Por isso, Object.keys(courseView) nao e automaticamente (keyof Course)[].
// Para iterar por um conjunto conhecido, declare explicitamente as chaves permitidas.
const visibleCourseKeys = ["title", "lessons", "published"] as const satisfies readonly (keyof Course)[];
for (const key of visibleCourseKeys) {
    console.log(`${courseLabels[key]}:`, courseView[key]);
}

// keyof existe apenas no sistema de tipos; nao enumera propriedades em runtime.

// TIPOS CONDICIONAIS: T extends U ? A : B escolhe um tipo conforme a compatibilidade.
// Neste contexto, extends pergunta se T pode ser atribuido a U.
type IsString<T> = T extends string ? true : false;
const stringCheck: IsString<string> = true;
const numberCheck: IsString<number> = false;
console.log("Condicionais basicas:", stringCheck, numberCheck);

// Podemos selecionar formatos diferentes conforme o tipo recebido.
type ValueDescription<T> = T extends string
    ? { kind: "text"; value: T; length: number }
    : { kind: "other"; value: T };

const textDescription: ValueDescription<string> = {
    kind: "text", value: "TypeScript", length: 10,
};
const numberDescription: ValueDescription<number> = { kind: "other", value: 42 };
console.log("Formatos condicionais:", textDescription, numberDescription);
// const invalidDescription: ValueDescription<number> = { kind: "text", value: 42, length: 2 };
// Erro: para number, o formato exige kind: "other".

// infer captura parte do tipo verificado para reutiliza-la no ramo verdadeiro.
type ArrayElement<T> = T extends readonly (infer Item)[] ? Item : never;
type CourseListItem = ArrayElement<readonly Course[]>; // Course
const extractedCourse: CourseListItem = course;
console.log("Elemento extraido do array:", extractedCourse.title);
// ArrayElement<number> resulta em never: number nao corresponde a um array.

type UnwrapPromise<T> = T extends Promise<infer Value> ? Value : T;
type LoadedSummary = UnwrapPromise<ReturnType<typeof loadUserSummary>>; // UserSummary
const unwrappedSummary: LoadedSummary = { id: rincko.id, name: rincko.name };
console.log("Tipo extraido da Promise:", unwrappedSummary);
// UnwrapPromise remove uma camada; Awaited<T> trata resolucao recursiva e thenables.

// Com um parametro T isolado a esquerda de extends, unions sao distribuidas.
type ToArray<T> = T extends unknown ? T[] : never;
type DistributedArray = ToArray<string | number>; // string[] | number[]
const textArray: DistributedArray = ["Ana", "Vini"];
const numericArray: DistributedArray = [10, 20];
console.log("Arrays distribuidos:", textArray, numericArray);
// const mixedArray: DistributedArray = ["Ana", 10]; // Erro: nao e string[] nem number[].

// Envolver os lados em tuplas impede a distribuicao e verifica a union inteira.
type NonDistributiveArray<T> = [T] extends [unknown] ? T[] : never;
const mixedConditionalArray: NonDistributiveArray<string | number> = ["Ana", 10];
console.log("Array sem distribuicao:", mixedConditionalArray);

// never elimina alternativas durante a distribuicao, permitindo filtrar unions.
type OnlyStrings<T> = T extends string ? T : never;
type TextOptions = OnlyStrings<"draft" | "published" | 0 | false>;
const textOption: TextOptions = "published";
console.log("Union filtrada:", textOption);
// Extract<T, U> e Exclude<T, U> sao utilitarios baseados nessa ideia.
type NumericOrBoolean = Exclude<string | number | boolean, string>;
const remainingOption: NumericOrBoolean = false;
console.log("Alternativa apos Exclude:", remainingOption);

// Condicionais tambem ajudam a selecionar chaves pelo tipo de seus valores.
type KeysMatching<T, Value> = {
    [K in keyof T]-?: T[K] extends Value ? K : never;
}[keyof T];

// -? remove a opcionalidade do tipo mapeado antes de extrair os valores.
// A condicao exige que o tipo completo da propriedade seja compativel com Value.
type NumericCourseKey = KeysMatching<Course, number>; // "lessons"
const numericCourseKey: NumericCourseKey = "lessons";
console.log("Campo numerico do curso:", course[numericCourseKey]);
// const wrongNumericKey: NumericCourseKey = "title"; // Erro: title contem string.

// Tipos condicionais desaparecem na compilacao: nao executam if nem validam valores.
// As decisoes em runtime continuam exigindo verificacoes reais, como typeof.

// NEVER: representa a ausencia de valores possiveis.
// Diferente de void (retorno ignorado), never indica que nao ha retorno normal.
function fail(message: string): never {
    throw new Error(message);
}

function requireCourseTitle(title: string | undefined): string {
    // Como fail nao retorna, depois de ?? o resultado so pode ser string.
    return title ?? fail("O titulo do curso e obrigatorio.");
}

console.log("Titulo obrigatorio:", requireCourseTitle("TypeScript"));
try {
    requireCourseTitle(undefined);
} catch (error: unknown) {
    console.log(error instanceof Error ? error.message : "Erro desconhecido.");
}

// undefined e um valor real; never nao possui sequer esse valor.
function returnUndefined(): undefined {
    return undefined;
}
console.log("Retorno undefined:", returnUndefined());
// const impossibleValue: never = undefined; // Erro: undefined nao e never.
// Uma funcao com loop infinito tambem pode retornar never, pois nunca termina.

// Exaustividade: quando todas as alternativas foram tratadas, resta never.
type DeliveryState =
    | { kind: "pending" }
    | { kind: "sent"; trackingCode: string }
    | { kind: "delivered"; receivedBy: string };

function describeDelivery(delivery: DeliveryState): string {
    switch (delivery.kind) {
        case "pending":
            return "Entrega pendente";
        case "sent":
            return `Entrega enviada: ${delivery.trackingCode}`;
        case "delivered":
            return `Entrega recebida por ${delivery.receivedBy}`;
        default: {
            // Uma nova variante sem case faz esta atribuicao falhar na compilacao.
            const unhandled: never = delivery;
            return assertNever(unhandled);
        }
    }
}

const deliveries: DeliveryState[] = [
    { kind: "pending" },
    { kind: "sent", trackingCode: "BR-123" },
    { kind: "delivered", receivedBy: "Ana" },
];
for (const delivery of deliveries) {
    console.log(describeDelivery(delivery));
}

// Em unions, never desaparece; em intersecoes incompativeis, nao ha valor possivel.
type TextOrNever = string | never; // string
type ImpossibleValue = string & number; // never
const possibleText: TextOrNever = "Uma union sem alternativas impossiveis";
console.log(possibleText);
// const impossibleIntersection: ImpossibleValue = 42; // Erro: number nao e never.

// Condicionais distributivos usam never para remover membros de uma union.
type RemoveNumbers<T> = T extends number ? never : T;
type WithoutNumbers = RemoveNumbers<string | number | boolean>; // string | boolean
const filteredValue: WithoutNumbers = true;
console.log("Union sem numeros:", filteredValue);

// Ao remapear chaves, produzir never remove a propriedade do novo tipo.
type StringFields<T> = {
    [K in keyof T as T[K] extends string ? K : never]: T[K];
};
const courseTextFields: StringFields<Course> = { title: course.title };
console.log("Campos textuais do curso:", courseTextFields);

// Cuidado: um condicional distributivo aplicado a never nao visita alternativas.
type DistributiveNeverCheck<T> = T extends never ? true : false;
// DistributiveNeverCheck<never> e never, e nao true.
// Tuplas desativam a distribuicao e permitem verificar never diretamente.
type IsNever<T> = [T] extends [never] ? true : false;
const impossibleTypeCheck: IsNever<ImpossibleValue> = true;
const ordinaryTypeCheck: IsNever<string> = false;
const distributedTypeCheck: IsNever<DistributiveNeverCheck<never>> = true;
console.log("Verificacoes de never:", impossibleTypeCheck, ordinaryTypeCheck, distributedTypeCheck);

// never e um resultado do sistema de tipos, nao uma validacao de dados externos.
// Evite "as never" para silenciar erros: isso pode esconder um caso nao tratado.

// READONLY: impede determinadas alteracoes durante a verificacao do TypeScript.
type ReadonlyLesson = {
    readonly id: string;
    title: string;
};

const readonlyLesson: ReadonlyLesson = { id: "lesson-1", title: "Readonly" };
readonlyLesson.title = "Aprendendo readonly"; // Apenas id esta protegido.
// readonlyLesson.id = "lesson-2"; // Erro: propriedade readonly.
console.log("Propriedade readonly:", readonlyLesson);

// const impede reatribuir a variavel; readonly restringe membros do tipo.
const editableLesson = { title: "Titulo inicial" };
editableLesson.title = "Titulo atualizado"; // Permitido mesmo com const.
// editableLesson = { title: "Outro" }; // Erro: a variavel e const.
console.log("Objeto declarado com const:", editableLesson);

// Readonly<T> aplica readonly a todas as propriedades do primeiro nivel.
type LessonSettings = {
    title: string;
    preferences: { autoplay: boolean };
};
const shallowReadonly: Readonly<LessonSettings> = {
    title: "Configuracao da aula",
    preferences: { autoplay: false },
};
// shallowReadonly.title = "Outro"; // Erro: propriedade readonly.
// shallowReadonly.preferences = { autoplay: true }; // Erro: nao pode substituir.
shallowReadonly.preferences.autoplay = true; // O objeto interno continua mutavel.
console.log("Readonly superficial:", shallowReadonly);

// Arrays readonly permitem leitura, mas nao push, splice ou atribuicao por indice.
const readonlyScores: readonly number[] = [7, 8, 10];
const alternativeScores: ReadonlyArray<number> = readonlyScores; // Sintaxe equivalente.
// readonlyScores.push(9); // Erro: metodo de mutacao indisponivel.
// readonlyScores[0] = 0; // Erro: indice somente leitura.

// Aceitar readonly permite receber tanto arrays mutaveis quanto somente leitura.
function averageScore(values: readonly number[]): number | undefined {
    if (values.length === 0) return undefined;
    return values.reduce((total, value) => total + value, 0) / values.length;
}
console.log("Media do array readonly:", averageScore(alternativeScores));
console.log("Media do array mutavel:", averageScore(scores));
console.log("Media da lista vazia:", averageScore([]));

// Para ordenar sem alterar a entrada, crie uma copia mutavel.
const sortedScores: number[] = [...readonlyScores].sort((left, right) => right - left);
console.log("Copia ordenada:", sortedScores, "Original:", readonlyScores);

// Tuplas readonly preservam o contrato de posicao sem permitir alterar elementos.
const lessonPosition: readonly [chapter: number, lesson: number] = [2, 3];
console.log("Tupla readonly:", lessonPosition);
// lessonPosition[0] = 5; // Erro: indice readonly.

// A visao readonly nao impede alteracoes por outra referencia mutavel.
const mutableTags: string[] = ["typescript"];
const tagView: readonly string[] = mutableTags;
mutableTags.push("readonly");
console.log("Visao readonly apos alteracao pela origem:", tagView);
// Uma copia separa o array da origem, mas nao clona os objetos internos.
const tagSnapshot: readonly string[] = [...mutableTags];
mutableTags.push("arrays");
console.log("Copia independente:", tagSnapshot, "Origem:", mutableTags);

// Object.freeze aplica uma restricao em runtime, tambem apenas no primeiro nivel.
const frozenSettings = Object.freeze({
    title: "Objeto congelado",
    preferences: { autoplay: false },
});
frozenSettings.preferences.autoplay = true; // O objeto interno nao foi congelado.
console.log("Congelado em runtime:", Object.isFrozen(frozenSettings));
console.log("Objeto interno congelado:", Object.isFrozen(frozenSettings.preferences));
// frozenSettings.title = "Outro"; // Erro de tipo; em runtime ESM tambem lancaria erro.

// as const preserva literais e torna readonly os membros literais da expressao.
// Referencias a objetos mutaveis existentes continuam permitindo mutacao interna.
const referencedTags: string[] = ["aula"];
const literalLesson = { title: "Readonly", tags: referencedTags } as const;
literalLesson.tags.push("referencia");
console.log("as const com referencia mutavel:", literalLesson);

// readonly nao clona nem congela objetos: descreve operacoes permitidas pelo tipo.

// AS CONST (CONST ASSERTION): preserva os valores literais de uma expressao.
let broadStatus = "draft"; // string: pode receber outros textos.
const literalStatus = "draft"; // "draft": primitivo const ja preserva o literal.
const ordinaryArticle = { status: "draft" }; // { status: string }
const constantArticle = { status: "draft" } as const; // { readonly status: "draft" }
broadStatus = "published";
ordinaryArticle.status = "archived";
console.log("Inferencia de literais:", broadStatus, literalStatus, ordinaryArticle, constantArticle);
// constantArticle.status = "published"; // Erro: propriedade readonly.

// Objetos e arrays literais aninhados tambem recebem tipos readonly.
const articleDefaults = {
    status: "draft",
    editor: { theme: "dark" },
    tags: ["typescript", "study"],
} as const;
// articleDefaults.editor.theme = "light"; // Erro: propriedade readonly.
// articleDefaults.tags.push("new"); // Erro: tupla readonly.
console.log("Literais aninhados:", articleDefaults);

// Um array literal vira uma tupla readonly com tipos e posicoes exatos.
const articleEntry = ["article-1", 10] as const; // readonly ["article-1", 10]
function describeArticleEntry(entry: readonly [id: string, views: number]): string {
    return `${entry[0]}: ${entry[1]} visualizacoes`;
}
console.log("Tupla com as const:", describeArticleEntry(articleEntry));

// Uma lista de valores pode ser a fonte unica de uma union.
const articleStatuses = ["draft", "published", "archived"] as const;
type ArticleStatus = (typeof articleStatuses)[number];

function publishArticle(status: ArticleStatus): void {
    console.log("Status aceito:", status);
}
publishArticle("published");
// publishArticle("deleted"); // Erro: literal fora da union.

// Sem as const, kind seria inferido como string no retorno desta funcao.
function createArticlePublishedEvent(articleId: string) {
    return { kind: "article:published", articleId } as const;
}
function createArticleArchivedEvent(articleId: string) {
    return { kind: "article:archived", articleId } as const;
}
type ArticleEvent = ReturnType<typeof createArticlePublishedEvent>
    | ReturnType<typeof createArticleArchivedEvent>;

function handleArticleEvent(event: ArticleEvent): string {
    switch (event.kind) {
        case "article:published":
            return `Artigo publicado: ${event.articleId}`;
        case "article:archived":
            return `Artigo arquivado: ${event.articleId}`;
        default:
            return assertNever(event);
    }
}
console.log(handleArticleEvent(createArticlePublishedEvent("article-1")));
console.log(handleArticleEvent(createArticleArchivedEvent("article-2")));

// satisfies verifica o formato; as const preserva os literais e aplica readonly.
type ArticleRoute = { path: string; method: "GET" | "POST" };
const articleRoutes = {
    list: { path: "/articles", method: "GET" },
    create: { path: "/articles", method: "POST" },
} as const satisfies Record<"list" | "create", ArticleRoute>;
const listMethod: "GET" = articleRoutes.list.method;
console.log("Rota validada com literais:", listMethod, articleRoutes.list.path);

// A assercao deve ser aplicada ao literal, nao a uma variavel ja inferida.
const previouslyInferred = { status: "draft" }; // status: string
// const tooLate = previouslyInferred as const; // Erro: nao e uma expressao literal.
console.log("Tipo amplo permanece:", previouslyInferred.status);
// Para uma condicao, aplique as const em cada literal, se necessario.
const binaryChoice = Math.random() > 0.5 ? (0 as const) : (1 as const); // 0 | 1
console.log("Union de literais condicionais:", binaryChoice);

// as const nao executa validacao, nao clona referencias e nao chama Object.freeze.
// As restricoes readonly sao verificadas durante a compilacao.

// PICK<T, K>: cria um tipo selecionando somente as propriedades K de T.
// As chaves precisam pertencer a keyof T.
type ArticleDetails = {
    readonly id: string;
    title: string;
    content: string;
    author: { name: string; email: string };
    subtitle?: string;
};
type ArticlePreview = Pick<ArticleDetails, "id" | "title" | "subtitle">;

const articleDetails: ArticleDetails = {
    id: "article-pick-1",
    title: "Aprendendo Pick",
    content: "Pick permite reutilizar partes de um tipo existente.",
    author: { name: "Ana", email: "ana@example.com" },
};
const articlePreview: ArticlePreview = {
    id: articleDetails.id,
    title: articleDetails.title,
};
console.log("Previa com Pick:", articlePreview);
// type InvalidPreview = Pick<ArticleDetails, "missing">; // Erro: chave inexistente.

// Pick preserva readonly e propriedades opcionais do tipo original.
articlePreview.title = "Titulo atualizado";
articlePreview.subtitle = "Selecionando propriedades";
// articlePreview.id = "outro-id"; // Erro: id continua readonly.
console.log("Previa atualizada:", articlePreview);

// Uma funcao pode exigir apenas os campos de que realmente precisa.
function renderArticleHeading(article: Pick<ArticleDetails, "title" | "subtitle">): string {
    return article.subtitle === undefined
        ? article.title
        : `${article.title}: ${article.subtitle}`;
}
console.log("Cabecalho da previa:", renderArticleHeading(articlePreview));
console.log("Cabecalho do artigo completo:", renderArticleHeading(articleDetails));

// Pick altera apenas o tipo: nao remove propriedades do objeto em runtime.
const previewView: ArticlePreview = articleDetails;
console.log("Mesmo objeto:", previewView === articleDetails);
console.log("Chaves reais da visao:", Object.keys(previewView));
// previewView.content; // Erro de tipo, embora content ainda exista no objeto real.

// Para selecionar valores em runtime, uma funcao precisa construir um novo objeto.
function pickProperties<T extends object, K extends keyof T>(
    source: T,
    keys: readonly K[],
): Pick<T, K> {
    // O objeto comeca vazio; a assercao representa o resultado completo do loop.
    const selected = {} as Pick<T, K>;
    for (const key of keys) {
        // defineProperty tambem trata nomes especiais como __proto__ como dados.
        Object.defineProperty(selected, key, {
            value: source[key],
            enumerable: true,
            writable: true,
            configurable: true,
        });
    }
    return selected;
}

const selectedArticle = pickProperties(articleDetails, ["id", "title"]);
console.log("Objeto com campos selecionados:", selectedArticle);
console.log("Chaves realmente selecionadas:", Object.keys(selectedArticle));
// selectedArticle.content; // Erro: content nao foi selecionado.
// pickProperties(articleDetails, ["missing"]); // Erro: chave inexistente.

// A selecao e superficial: valores que sao objetos continuam compartilhados.
const selectedAuthor = pickProperties(articleDetails, ["author"]);
console.log("Referencia do autor compartilhada:", selectedAuthor.author === articleDetails.author);

// Pick pode ser combinado com outros utilitarios.
type ArticleTitleUpdate = Partial<Pick<ArticleDetails, "title" | "subtitle">>;
type RequiredArticleHeading = Required<Pick<ArticleDetails, "title" | "subtitle">>;
const titleUpdate: ArticleTitleUpdate = { title: "Novo titulo" };
const requiredHeading: RequiredArticleHeading = { title: "Pick", subtitle: "Exemplos praticos" };
console.log("Atualizacao parcial:", titleUpdate);
console.log("Cabecalho obrigatorio:", renderArticleHeading(requiredHeading));

// Pick seleciona chaves; Omit faz o inverso, removendo as chaves indicadas.

// OMIT<T, K>: cria um tipo removendo as propriedades K de T.
// O tipo original continua intacto.
type ArticleCreateInput = Omit<ArticleDetails, "id">;

function createStudyArticle(input: ArticleCreateInput): ArticleDetails {
    return { ...input, id: crypto.randomUUID() };
}

const createdArticle = createStudyArticle({
    title: "Aprendendo Omit",
    content: "Reutilizando tipos sem os campos gerados pelo sistema.",
    author: { name: "Vini", email: "vini@example.com" },
});
console.log("Artigo criado sem informar id:", createdArticle);
// createStudyArticle({ title: "Incompleto" }); // Erro: faltam content e author.

// Uma union de chaves permite remover varios campos de uma vez.
type ArticleCard = Omit<ArticleDetails, "content" | "author">;
const articleCard: ArticleCard = { id: createdArticle.id, title: createdArticle.title };
articleCard.subtitle = "Cartao sem conteudo e autor";
// articleCard.id = "outro"; // Erro: readonly foi preservado.
console.log("Cartao com Omit:", articleCard);

// Partial torna opcionais os campos restantes para uma atualizacao parcial.
type ArticleEditInput = Partial<Omit<ArticleDetails, "id" | "author">>;
const articleEdit: ArticleEditInput = { title: "Titulo revisado" };
console.log("Edicao parcial sem id e autor:", articleEdit);
// const invalidEdit: ArticleEditInput = { id: "outro" }; // Erro no literal: id removido.

// Omit e superficial: uma chave aninhada precisa ser tratada no seu proprio tipo.
type PublicAuthor = Omit<ArticleDetails["author"], "email">;
type PublicArticle = Omit<ArticleDetails, "author"> & { author: PublicAuthor };

// Para realmente retirar dados, construimos um objeto em tempo de execucao.
const publicArticle: PublicArticle = {
    ...createdArticle,
    author: { name: createdArticle.author.name },
};
console.log("Autor sem email no objeto real:", publicArticle.author);
// Omit<ArticleDetails, "author.email"> nao remove o email aninhado.

// Uma anotacao Omit nao apaga propriedades do objeto existente.
const articleCardView: ArticleCard = createdArticle;
console.log("Visao continua sendo o mesmo objeto:", articleCardView === createdArticle);
console.log("Campos reais da visao:", Object.keys(articleCardView));
// articleCardView.content; // Erro de tipo; o dado ainda existe em runtime.

// Rest destructuring cria um novo objeto sem as propriedades extraidas.
const { content: removedContent, author: removedAuthor, ...articleWithoutContent } = createdArticle;
console.log("Campos realmente removidos:", removedContent.length, removedAuthor.name);
console.log("Cartao criado em runtime:", articleWithoutContent);
// A copia e superficial: outros objetos internos, se houver, nao sao clonados.

// Omit tambem permite substituir o tipo de uma propriedade removida.
type ArticleWithAuthorName = Omit<ArticleDetails, "author"> & { author: string };
const articleWithAuthorName: ArticleWithAuthorName = {
    ...createdArticle,
    author: createdArticle.author.name,
};
console.log("Autor convertido para nome:", articleWithAuthorName.author.toUpperCase());

// O Omit nativo aceita chaves inexistentes e simplesmente nao remove nada.
// Um alias com K extends keyof T pode exigir que as chaves existam.
type StrictOmit<T, K extends keyof T> = Omit<T, K>;
const strictArticleCard: StrictOmit<ArticleDetails, "content" | "author"> = articleCard;
console.log("Omit com chaves restritas:", strictArticleCard.title);
// type InvalidOmission = StrictOmit<ArticleDetails, "missing">; // Erro: chave inexistente.

// Omit descreve um formato; nao garante ausencia de campos extras em runtime.

// PARTIAL<T>: torna opcionais todas as propriedades do primeiro nivel de T.
type StudyPreferences = {
    theme: "light" | "dark";
    dailyMinutes: number;
    notifications: { email: boolean; push: boolean };
};

const studyPreferences: StudyPreferences = {
    theme: "light",
    dailyMinutes: 30,
    notifications: { email: true, push: false },
};
const preferencesPatch: Partial<StudyPreferences> = { theme: "dark" };
const emptyPreferencesPatch: Partial<StudyPreferences> = {}; // Nenhum campo e obrigatorio.
console.log("Patches com Partial:", preferencesPatch, emptyPreferencesPatch);
// const invalidPatch: Partial<StudyPreferences> = { dailyMinutes: "30" }; // Tipo incorreto.

// Propriedades opcionais exigem tratamento de undefined durante a leitura.
function describePreferencesPatch(patch: Partial<StudyPreferences>): string {
    return patch.dailyMinutes === undefined
        ? "Tempo de estudo nao alterado"
        : `Novo tempo: ${patch.dailyMinutes} minutos`;
}
console.log(describePreferencesPatch(preferencesPatch));
console.log(describePreferencesPatch({ dailyMinutes: 45 }));

// Partial e um tipo: a funcao ainda precisa implementar como aplicar as mudancas.
function updatePreferences(
    current: StudyPreferences,
    patch: Partial<StudyPreferences>,
): StudyPreferences {
    return {
        // Ignoramos undefined explicitamente para preservar os valores atuais.
        theme: patch.theme ?? current.theme,
        dailyMinutes: patch.dailyMinutes ?? current.dailyMinutes,
        notifications: patch.notifications ?? current.notifications,
    };
}
const updatedPreferences = updatePreferences(studyPreferences, preferencesPatch);
console.log("Preferencias atualizadas:", updatedPreferences);
console.log("Preferencias originais:", studyPreferences);

// Partial e superficial: se notifications for informado, precisa estar completo.
const notificationReplacement: Partial<StudyPreferences> = {
    notifications: { email: false, push: true },
};
console.log("Substituicao do objeto interno:", updatePreferences(studyPreferences, notificationReplacement));
// const incompleteNotifications: Partial<StudyPreferences> = { notifications: { push: true } };
// Erro: email continua obrigatorio dentro de notifications.

// Para editar o objeto interno parcialmente, declaramos esse contrato explicitamente.
type StudyPreferencesPatch = Partial<Omit<StudyPreferences, "notifications">> & {
    notifications?: Partial<StudyPreferences["notifications"]>;
};

function updateNestedPreferences(
    current: StudyPreferences,
    patch: StudyPreferencesPatch,
): StudyPreferences {
    return updatePreferences(current, {
        theme: patch.theme ?? current.theme,
        dailyMinutes: patch.dailyMinutes ?? current.dailyMinutes,
        notifications: {
            email: patch.notifications?.email ?? current.notifications.email,
            push: patch.notifications?.push ?? current.notifications.push,
        },
    });
}
console.log("Atualizacao aninhada:", updateNestedPreferences(studyPreferences, {
    notifications: { email: false }, // push e preservado; false nao e ignorado por ??.
}));

// Combine Pick e Partial para permitir alterar apenas campos selecionados.
type StudySchedulePatch = Partial<Pick<StudyPreferences, "theme" | "dailyMinutes">>;
const schedulePatch: StudySchedulePatch = { dailyMinutes: 60 };
console.log("Atualizacao de campos selecionados:", schedulePatch);
// const forbiddenSchedule: StudySchedulePatch = { notifications: { email: true, push: true } };

// Uma intersecao pode manter uma propriedade obrigatoria e as demais opcionais.
type IdentifiedArticlePatch = Pick<ArticleDetails, "id"> & Partial<Omit<ArticleDetails, "id">>;
const identifiedArticlePatch: IdentifiedArticlePatch = { id: createdArticle.id, title: "Partial na pratica" };
console.log("Patch com identificador obrigatorio:", identifiedArticlePatch);
// const missingPatchId: IdentifiedArticlePatch = { title: "Sem id" }; // Erro: falta id.

// Partial preserva readonly: tornar opcional nao torna uma propriedade editavel.
const optionalArticleId: Partial<Pick<ArticleDetails, "id">> = { id: createdArticle.id };
console.log("ID opcional e readonly:", optionalArticleId.id);
// optionalArticleId.id = "outro"; // Erro: readonly foi preservado.

// Com exactOptionalPropertyTypes desligado, um campo opcional aceita undefined explicito.
// Por isso, as funcoes acima tratam undefined antes de montar o objeto completo.
// Partial nao valida valores em runtime nem define sozinho regras de atualizacao.

// REQUIRED<T>: torna obrigatorias todas as propriedades do primeiro nivel de T.
type StudyOptions = {
    readonly courseId?: string;
    theme?: "light" | "dark";
    dailyMinutes?: number;
    reminders?: { email?: boolean; push?: boolean };
};
type CompleteStudyOptions = Required<StudyOptions>;

const completeStudyOptions: CompleteStudyOptions = {
    courseId: "typescript-1",
    theme: "dark",
    dailyMinutes: 30,
    reminders: { email: true },
};
console.log("Opcoes obrigatorias:", completeStudyOptions);
// const incompleteOptions: CompleteStudyOptions = { courseId: "ts-1" };
// Erro: faltam theme, dailyMinutes e reminders.
// completeStudyOptions.courseId = "outro"; // readonly continua preservado.

// Required e superficial: reminders e obrigatorio, mas seus campos ainda sao opcionais.
const optionsWithEmptyReminders: CompleteStudyOptions = {
    ...completeStudyOptions,
    reminders: {},
};
console.log("Objeto interno ainda opcional:", optionsWithEmptyReminders.reminders.email);

// Para exigir os campos internos, aplicamos Required explicitamente nesse nivel.
type ResolvedStudyOptions = Omit<CompleteStudyOptions, "reminders"> & {
    reminders: Required<NonNullable<StudyOptions["reminders"]>>;
};

// O tipo nao preenche valores: esta funcao implementa os padroes em runtime.
function resolveStudyOptions(options: StudyOptions): ResolvedStudyOptions {
    return {
        courseId: options.courseId ?? "typescript-default",
        theme: options.theme ?? "light",
        dailyMinutes: options.dailyMinutes ?? 30,
        reminders: {
            email: options.reminders?.email ?? true,
            push: options.reminders?.push ?? false,
        },
    };
}
console.log("Padroes para opcoes vazias:", resolveStudyOptions({}));
console.log("Opcoes fornecidas preservadas:", resolveStudyOptions({
    theme: "dark",
    reminders: { email: false },
}));

// Required<Pick<...>> exige somente os campos selecionados.
type RequiredStudyIdentity = Required<Pick<StudyOptions, "courseId" | "theme">>;
const studyIdentity: RequiredStudyIdentity = { courseId: "ts-2", theme: "light" };
console.log("Campos selecionados obrigatorios:", studyIdentity);

// Podemos exigir uma chave e manter as outras propriedades opcionais.
type OptionsWithCourseId = StudyOptions & Required<Pick<StudyOptions, "courseId">>;
const optionsWithCourseId: OptionsWithCourseId = { courseId: "ts-3" };
console.log("Somente courseId obrigatorio:", optionsWithCourseId);
// const missingCourseId: OptionsWithCourseId = { theme: "dark" }; // Erro: falta courseId.

// Required e Partial alteram a obrigatoriedade das propriedades no primeiro nivel.
const restoredPreferences: Required<Partial<StudyPreferences>> = studyPreferences;
console.log("Propriedades obrigatorias novamente:", restoredPreferences);

// Obrigatorio nao significa nao nulo nem string nao vazia.
type OptionalContact = { email?: string | null };
const requiredContact: Required<OptionalContact> = { email: null }; // null permanece permitido.
const emptyContact: Required<OptionalContact> = { email: "" }; // Conteudo nao e validado.
console.log("Campo presente com null:", requiredContact);
console.log("Campo presente com string vazia:", emptyContact);

// Com exactOptionalPropertyTypes desligado neste projeto, Required remove tambem
// undefined de propriedades opcionais como theme?: string, no modo strict.
// Required nao valida dados externos; use guards ou validacao antes de confiar neles.

// EXCLUDE<T, U>: remove de uma union T os membros atribuiveis a U.
// Sua ideia central e: T extends U ? never : T, distribuido por cada membro de T.
type EditableArticleStatus = Exclude<ArticleStatus, "archived">; // "draft" | "published"
const editableArticleStatus: EditableArticleStatus = "draft";
console.log("Status sem archived:", editableArticleStatus);
// const excludedStatus: EditableArticleStatus = "archived"; // Erro: alternativa removida.

// Uma union no segundo argumento permite remover varias alternativas.
type ScalarValue = string | number | boolean | null | undefined;
type TextOrNumberValue = Exclude<ScalarValue, boolean | null | undefined>;
const remainingScalar: TextOrNumberValue = 42;
console.log("Union apos varias exclusoes:", remainingScalar);

// Para remover somente null e undefined, NonNullable<T> expressa essa intencao.
type PresentScalar = NonNullable<ScalarValue>; // string | number | boolean
const presentScalar: PresentScalar = false;
console.log("Valor nao nulo preservado:", presentScalar);

// A exclusao depende de compatibilidade, nao de subtrair valores de um tipo amplo.
type BroadText = Exclude<string, "archived">; // Continua string.
const stillAllowedText: BroadText = "archived";
console.log("Literal dentro de string ampla:", stillAllowedText);
// string nao e atribuivel a "archived", portanto o membro string nao e removido.

// Em unions discriminadas, podemos remover uma variante pelo seu discriminante.
type BalanceCommand = Exclude<WalletCommand, { kind: "history" }>;

function describeBalanceCommand(command: BalanceCommand): string {
    return `${command.kind}: ${command.amount} ${command.currency}`;
}
console.log("Comando sem history:", describeBalanceCommand({
    kind: "deposit", currency: "coins", amount: 10,
}));
// describeBalanceCommand({ kind: "history" }); // Erro: variante excluida.

// Exclude filtra membros inteiros; Omit remove propriedades de um objeto.
type CourseStillComplete = Exclude<Course, "title">; // Continua Course.
type CourseWithoutTitle = Omit<Course, "title">; // { lessons: number; published: boolean }
const completeCourseAfterExclude: CourseStillComplete = course;
const courseWithoutTitle: CourseWithoutTitle = { lessons: 15, published: true };
console.log("Exclude preservou o objeto:", completeCourseAfterExclude.title);
console.log("Omit removeu a chave do tipo:", courseWithoutTitle);

// Para excluir chaves, primeiro obtemos a union delas com keyof.
type NonTitleCourseKey = Exclude<keyof Course, "title">; // "lessons" | "published"
type CourseMetrics = Pick<Course, NonTitleCourseKey>;
const courseMetrics: CourseMetrics = { lessons: course.lessons, published: course.published };
console.log("Chaves filtradas com Exclude:", courseMetrics);

// Exclude nao altera arrays em runtime: filter precisa executar a verificacao.
function isEditableArticleStatus(status: ArticleStatus): status is EditableArticleStatus {
    return status !== "archived";
}
const editableStatuses: EditableArticleStatus[] = articleStatuses.filter(isEditableArticleStatus);
console.log("Status filtrados em runtime:", editableStatuses);
console.log("Lista original preservada:", articleStatuses);

// Se todas as alternativas forem removidas, o resultado e never.
type NoArticleStatus = Exclude<ArticleStatus, ArticleStatus>;
const allStatusesExcluded: IsNever<NoArticleStatus> = true;
console.log("Exclusao completa resulta em never:", allStatusesExcluded);
// Extract faz o complemento: mantem os membros compativeis com o segundo tipo.
type ArchivedStatus = Extract<ArticleStatus, "archived">;
const archivedOnly: ArchivedStatus = "archived";
console.log("Alternativa mantida com Extract:", archivedOnly);

// NONNULLABLE<T>: remove null e undefined de um tipo.
type OptionalDisplayName = string | null | undefined;
type DisplayName = NonNullable<OptionalDisplayName>; // string
const displayName: DisplayName = "Ana";
console.log("Nome nao nulo:", displayName);
// const nullDisplayName: DisplayName = null; // Erro com strictNullChecks ativo.
// const undefinedDisplayName: DisplayName = undefined; // Erro pelo mesmo motivo.

// Outros valores, como 0, false e string vazia, continuam permitidos.
type PresentSetting = NonNullable<string | number | boolean | null | undefined>;
const presentSettings: PresentSetting[] = ["", 0, false];
console.log("Valores validos preservados:", presentSettings);

// O utilitario altera o tipo, mas nao transforma nem verifica um valor real.
function requirePresent<T>(value: T): NonNullable<T> {
    if (value === null || value === undefined) {
        throw new Error("O valor nao pode ser null nem undefined.");
    }
    // A verificacao permite retornar o valor refinado sem usar as.
    return value;
}
const possiblyMissingName: OptionalDisplayName = profileNames.find(name => name === "Ana");
console.log("Nome verificado em runtime:", requirePresent(possiblyMissingName));
try {
    requirePresent(null);
} catch (error: unknown) {
    console.log(error instanceof Error ? error.message : "Erro desconhecido.");
}

// Um predicado generico permite filtrar null e undefined de arrays.
function isPresent<T>(value: T): value is NonNullable<T> {
    return value !== null && value !== undefined;
}
const nullableScores: (number | null | undefined)[] = [0, 7, null, 10, undefined];
const presentScores: number[] = nullableScores.filter(isPresent);
console.log("Notas presentes, incluindo zero:", presentScores);
// filter(Boolean) descartaria 0 tambem; nao expressa a mesma regra.

// Acesso indexado a uma propriedade opcional inclui undefined.
type OptionalReminderSettings = StudyOptions["reminders"];
type PresentReminderSettings = NonNullable<OptionalReminderSettings>;
const presentReminders: PresentReminderSettings = {}; // email e push ainda sao opcionais.
console.log("Objeto presente com campos opcionais:", presentReminders);

// NonNullable nao percorre propriedades internas e nao as torna obrigatorias.
type NullableContactCard = {
    name: string | null;
    email?: string | null;
} | null | undefined;
const contactCard: NonNullable<NullableContactCard> = { name: null };
console.log("Objeto nao nulo com campo nulo:", contactCard);

// Para exigir cada campo e retirar null/undefined dos valores, use um tipo mapeado.
type PresentFields<T> = { [K in keyof T]-?: NonNullable<T[K]> };
type CompleteContactCard = PresentFields<NonNullable<NullableContactCard>>;
const completeContactCard: CompleteContactCard = { name: "Ana", email: "ana@example.com" };
console.log("Campos obrigatorios e nao nulos:", completeContactCard);
// Este mapeamento e superficial: objetos internos precisam de regras proprias.

// Required exige a presenca; null explicitamente permitido continua no tipo.
type ContactWithNull = Required<{ email?: string | null }>;
type ContactWithoutNull = { email: NonNullable<ContactWithNull["email"]> };
const contactWithNull: ContactWithNull = { email: null };
const contactWithoutNull: ContactWithoutNull = { email: "vini@example.com" };
console.log("Required permite null:", contactWithNull);
console.log("NonNullable aplicado ao campo:", contactWithoutNull);

// Quando o tipo contem apenas null e undefined, nao resta alternativa: never.
type NoPresentValue = NonNullable<null | undefined>;
const noPresentValueCheck: IsNever<NoPresentValue> = true;
console.log("Sem valores nao nulos:", noPresentValueCheck);
// NonNullable nao verifica conteudo: uma string vazia continua sendo string valida.

// EXTRACT<T, U>: mantem os membros de T que podem ser atribuidos a U.
// Equivale a T extends U ? T : never, distribuido pelos membros da union T.
type VisibleArticleStatus = Extract<ArticleStatus, "published" | "archived">;
const visibleArticleStatus: VisibleArticleStatus = "published";
console.log("Status selecionado com Extract:", visibleArticleStatus);
// const hiddenArticleStatus: VisibleArticleStatus = "draft"; // Erro: membro nao selecionado.

// O segundo argumento tambem pode ser um tipo amplo.
type TextMembers = Extract<string | number | boolean | null, string>;
const extractedText: TextMembers = "TypeScript";
console.log("Membro textual extraido:", extractedText);

// A direcao da compatibilidade importa: string nao e atribuivel a um unico literal.
type LiteralFromBroadString = Extract<string, "published">; // never
type LiteralFromUnion = Extract<"draft" | "published", string>; // "draft" | "published"
const broadStringCheck: IsNever<LiteralFromBroadString> = true;
const literalFromUnion: LiteralFromUnion = "draft";
console.log("Compatibilidade em Extract:", broadStringCheck, literalFromUnion);

// Unions discriminadas podem ser filtradas pelo formato de uma variante.
type DepositCommand = Extract<WalletCommand, { kind: "deposit" }>;
type AmountCommand = Extract<WalletCommand, { amount: number }>;

const extractedDeposit: DepositCommand = { kind: "deposit", currency: "coins", amount: 25 };
const extractedWithdrawal: AmountCommand = { kind: "withdraw", currency: "credits", amount: 5 };
console.log("Variante de deposito:", extractedDeposit);
console.log("Variante com valor:", extractedWithdrawal);
// AmountCommand mantem deposit e withdraw; history nao possui amount.

// Um predicado executa a verificacao real para filtrar os valores de um array.
function isDepositCommand(command: WalletCommand): command is DepositCommand {
    return command.kind === "deposit";
}
const depositCommands: DepositCommand[] = commands.filter(isDepositCommand);
console.log("Depositos filtrados em runtime:", depositCommands);

// Extract tambem encontra chaves compartilhadas por dois tipos.
type CourseCardFields = { title: string; published: boolean; thumbnail: string };
type SharedCourseCardKey = Extract<keyof Course, keyof CourseCardFields>;
type SharedCourseCard = Pick<Course, SharedCourseCardKey>;
const sharedCourseCard: SharedCourseCard = { title: course.title, published: course.published };
console.log("Campos com chaves compartilhadas:", sharedCourseCard);
// A selecao compara as chaves; nao verifica a compatibilidade dos valores entre tipos.

// Template literal types permitem selecionar membros por um padrao textual.
type ApplicationEventName = "user:created" | "user:deleted" | "article:published" | "article:archived";
type ArticleEventName = Extract<ApplicationEventName, `article:${string}`>;
const selectedArticleEvent: ArticleEventName = "article:published";
console.log("Evento selecionado por prefixo:", selectedArticleEvent);

// Extract mantem membros; Exclude remove os membros compativeis.
type SelectedNumber = Extract<string | number | boolean, number>; // number
type RemovedNumber = Exclude<string | number | boolean, number>; // string | boolean
const selectedNumber: SelectedNumber = 10;
const remainingNonNumber: RemovedNumber = false;
console.log("Extract e Exclude:", selectedNumber, remainingNonNumber);

// Se nenhum membro corresponder, o resultado e never.
type NoMatchingStatus = Extract<ArticleStatus, "deleted">;
const noMatchingStatusCheck: IsNever<NoMatchingStatus> = true;
console.log("Nenhum membro correspondente:", noMatchingStatusCheck);
// Extract atua apenas nos tipos: nao seleciona valores nem remove propriedades em runtime.

// MAPPED TYPES: percorrem uma union de chaves para construir propriedades.
// K representa cada chave durante o mapeamento; T[K] acessa seu tipo original.
type BooleanFlags<T> = { [K in keyof T]: boolean };
const courseFlags: BooleanFlags<Course> = {
    title: true,
    lessons: false,
    published: true,
};
console.log("Campos transformados em flags:", courseFlags);

// Um mapeamento tambem pode preservar os valores e alterar seus modificadores.
type ReadonlyFields<T> = { readonly [K in keyof T]: T[K] };
type MutableFields<T> = { -readonly [K in keyof T]: T[K] };
type OptionalFields<T> = { [K in keyof T]?: T[K] };
type RequiredFields<T> = { [K in keyof T]-?: T[K] };

const mappedReadonlyCourse: ReadonlyFields<Course> = { ...course };
// mappedReadonlyCourse.title = "Outro"; // Erro: propriedade readonly.
const mutableArticlePreview: MutableFields<ArticlePreview> = { ...articlePreview };
mutableArticlePreview.id = "preview-editable"; // -readonly permite reatribuir id.
const optionalCourseFields: OptionalFields<Course> = { title: "Mapped types" };
const requiredPreviewFields: RequiredFields<ArticlePreview> = {
    id: "preview-required",
    title: "Todos os campos presentes",
    subtitle: "O modificador -? remove a opcionalidade",
};
console.log("Mapeamento readonly:", mappedReadonlyCourse);
console.log("Modificador readonly removido:", mutableArticlePreview);
console.log("Campos opcionais:", optionalCourseFields);
console.log("Campos obrigatorios:", requiredPreviewFields);
// Esses formatos correspondem a ideias usadas em Readonly, Partial e Required.

// Sem modificadores explicitos, um mapeamento sobre keyof T preserva os existentes.
type WrappedFields<T> = { [K in keyof T]: { value: T[K] } };
const wrappedPreview: WrappedFields<ArticlePreview> = {
    id: { value: "wrapped-1" },
    title: { value: "Valores encapsulados" },
    // subtitle continua opcional; id continua readonly no primeiro nivel.
};
wrappedPreview.id.value = "wrapped-2"; // O objeto interno nao foi tornado readonly.
console.log("Valores transformados com modificadores preservados:", wrappedPreview);

// "as" dentro do mapeamento renomeia chaves; nao e uma assercao de valores.
// Extract filtra chaves string para que Capitalize possa transforma-las.
type GetterMethods<T> = {
    [K in keyof T as `get${Capitalize<Extract<K, string>>}`]: () => T[K];
};
const courseGetters: GetterMethods<Course> = {
    getTitle: () => course.title,
    getLessons: () => course.lessons,
    getPublished: () => course.published,
};
console.log("Chaves renomeadas:", courseGetters.getTitle(), courseGetters.getLessons());
// O tipo nao cria os metodos: a implementacao acima define cada funcao em runtime.

// Remapear uma chave para never remove essa propriedade do resultado.
type StringProperties<T> = {
    [K in keyof T as T[K] extends string ? K : never]: T[K];
};
const textualCourse: StringProperties<Course> = { title: course.title };
console.log("Propriedades filtradas pelo valor:", textualCourse);
// Propriedades string opcionais incluem undefined e nao passam nessa condicao estrita.

// A fonte de um mapeamento tambem pode ser uma union discriminada de objetos.
type ArticleEventHandlers = {
    [Event in ArticleEvent as Event["kind"]]: (event: Event) => string;
};
const articleEventHandlers: ArticleEventHandlers = {
    "article:published": event => `Publicacao processada: ${event.articleId}`,
    "article:archived": event => `Arquivamento processado: ${event.articleId}`,
};
console.log(articleEventHandlers["article:published"](createArticlePublishedEvent("mapped-1")));
console.log(articleEventHandlers["article:archived"](createArticleArchivedEvent("mapped-2")));
// Cada handler recebe a variante correspondente a sua chave.

// Mapped types descrevem estruturas em compilacao; nao percorrem objetos em runtime.

// INFER: declara uma variavel de tipo dentro da condicao de um tipo condicional.
// O tipo capturado pode ser usado no ramo verdadeiro da condicao.
type InferredItem<T> = T extends readonly (infer Item)[] ? Item : never;
const inferredScore: InferredItem<typeof readonlyScores> = 10; // number
const inferredStatus: InferredItem<typeof articleStatuses> = "draft"; // Union de literais.
console.log("Elementos capturados com infer:", inferredScore, inferredStatus);

// Podemos capturar os parametros e o retorno de uma assinatura de funcao.
type FunctionArguments<T> = T extends (...args: infer Args) => unknown ? Args : never;
type FunctionResult<T> = T extends (...args: infer _Args) => infer ResultValue ? ResultValue : never;

const inferredArguments: FunctionArguments<typeof calculateTotal> = [25, 3];
const inferredResult: FunctionResult<typeof calculateTotal> = calculateTotal(...inferredArguments);
console.log("Parametros e retorno inferidos:", inferredArguments, inferredResult);
// Parameters<T> e ReturnType<T> sao os utilitarios nativos para essas tarefas.
// Em funcoes com overload, essa extracao considera a ultima assinatura publica.
const inferredOverloadArguments: FunctionArguments<typeof createDate> = [2026, 10, 30];
console.log("Parametros do ultimo overload:", inferredOverloadArguments);

// Padroes de tupla podem capturar a primeira posicao e o restante separadamente.
type TupleHead<T> = T extends readonly [infer Head, ...infer _Rest] ? Head : never;
type TupleTail<T> = T extends readonly [infer _Head, ...infer Rest] ? Rest : never;
const inferredHead: TupleHead<typeof articleEntry> = "article-1";
const inferredTail: TupleTail<typeof articleEntry> = [10];
console.log("Cabeca e cauda da tupla:", inferredHead, inferredTail);
// Uma tupla vazia nao corresponde a esse padrao: TupleHead<[]> resulta em never.
// O tipo Rest capturado aqui nao recebe readonly automaticamente.

// A extracao pode ser recursiva para resolver varias camadas de um formato.
type ResolvePromiseType<T> = T extends Promise<infer Inner> ? ResolvePromiseType<Inner> : T;
type NestedSummaryResult = ResolvePromiseType<Promise<Promise<UserSummary>>>;
const resolvedSummary: NestedSummaryResult = { id: rincko.id, name: rincko.name };
console.log("Resultado de extracao recursiva:", resolvedSummary);
// Awaited<T> e a alternativa nativa, com suporte tambem a objetos thenable.

// Template literal types capturam trechos de strings conhecidas pelo compilador.
type EventParts<T> = T extends `${infer Domain}:${infer Action}`
    ? { domain: Domain; action: Action }
    : never;
const inferredEventParts: EventParts<"article:published"> = {
    domain: "article",
    action: "published",
};
console.log("Partes extraidas do literal:", inferredEventParts);
// EventParts<"invalid"> resulta em never; isso nao executa split em runtime.

// Uma restricao em infer exige que o trecho capturado seja compativel com um tipo.
type FirstTextItem<T> = T extends readonly [infer First extends string, ...infer _Rest]
    ? First
    : never;
const firstTextItem: FirstTextItem<readonly ["TypeScript", 42]> = "TypeScript";
const rejectedFirstItem: IsNever<FirstTextItem<readonly [42, "TypeScript"]>> = true;
console.log("Infer com restricao:", firstTextItem, rejectedFirstItem);

// Como outros condicionais com T isolado, infer pode operar sobre cada membro da union.
type InferredUnionItem = InferredItem<string[] | number[]>; // string | number
const inferredUnionItems: InferredUnionItem[] = ["Ana", 42];
console.log("Extracao distribuida:", inferredUnionItems);

// infer so e permitido na clausula extends de um tipo condicional.
// Nao inspeciona valores em runtime nem substitui validacao de dados externos.

// DECLARE E .D.TS: descrevem valores e contratos sem gerar sua implementacao.
// study-runtime.d.ts declara StudyRuntime e globalThis.studyRuntime para o projeto.
// O import type no inicio deste arquivo desaparece do JavaScript compilado.
const runtimeOptions: StudyRuntimeOptions = { prefix: "[Estudos TypeScript]" };

// A declaracao nao cria o valor: esta atribuicao fornece a implementacao real.
globalThis.studyRuntime = {
    version: "1.0.0",
    log(message: string): void {
        console.log(`${runtimeOptions.prefix} ${message}`);
    },
};

function reportStudyRuntime(): void {
    const runtime = globalThis.studyRuntime;
    if (runtime === undefined) {
        console.log("Runtime de estudos ainda nao inicializado.");
        return;
    }
    runtime.log(`Runtime inicializado, versao ${runtime.version}`);
}
reportStudyRuntime();

// declare tambem pode aparecer em um .ts para descrever algo fornecido externamente.
// Por exemplo, uma ferramenta de build poderia substituir esse identificador.
declare const STUDY_BUILD_LABEL: string | undefined;

// Se o identificador nao existir em runtime, typeof permite verificar sem ReferenceError.
if (typeof STUDY_BUILD_LABEL !== "undefined") {
    console.log("Rotulo fornecido pelo ambiente:", STUDY_BUILD_LABEL.toUpperCase());
} else {
    console.log("Nenhum rotulo de build foi fornecido.");
}
// console.log(STUDY_BUILD_LABEL); // ReferenceError se o ambiente nao fornecer o valor.

// A declaracao global afeta a tipagem de todo o projeto; use nomes especificos.
// Em bibliotecas reais, prefira os tipos oficiais ou @types quando disponiveis.
// Um .d.ts de biblioteca tambem pode exportar assinaturas de funcoes e classes,
// mas importar esses valores exige uma implementacao JavaScript real correspondente.
// Evite importar .d.ts por efeito colateral: ele nao produz um arquivo executavel.
// declare nao instala dependencias, nao cria valores e nao valida dados em runtime.

// IMPORT ALIAS: renomeia uma importacao dentro do arquivo que a utiliza.
// No inicio deste arquivo, formatLesson foi importada como formatImportedLesson.
// Isso ajuda a evitar conflitos e dar contexto a nomes de outros modulos.
const aliasLesson: ImportedLessonInfo = {
    title: "Importacoes com alias",
    durationMinutes: 20,
};
console.log("Exportacao nomeada com alias:", formatImportedLesson(aliasLesson));
console.log("Constante importada com alias:", lessonModuleName);

// O alias muda o nome local; a exportacao original continua sendo formatLesson.
console.log("Mesma funcao exportada:", formatImportedLesson === LessonModule.formatLesson);

// import type permite renomear tipos sem gerar uma importacao JavaScript para eles.
// ImportedLessonInfo e o nome local da interface LessonInfo do modulo de apoio.
// console.log(ImportedLessonInfo); // Erro: interface nao existe como valor em runtime.

// Uma exportacao default e nomeada diretamente, sem precisar de "as".
const defaultAliasLesson = buildAliasLesson("Exportacao default", 15);
console.log("Default com nome local:", formatImportedLesson(defaultAliasLesson));

// import * as cria um namespace com as exportacoes de valor do modulo.
const namespaceLesson = LessonModule.default("Namespace de modulo", 10);
console.log("Acesso pelo namespace:", LessonModule.formatLesson(namespaceLesson));

// Em Node ESM com module: nodenext, usamos .js nos caminhos relativos do .ts.
// O TypeScript resolve o fonte correspondente; o JavaScript aponta para o .js gerado.
// "as" em imports renomeia simbolos: nao e uma assercao de tipo.
// Alias de caminho (como @/modulo) e outro recurso: paths no tsconfig sozinho
// nao reescreve imports emitidos nem configura a resolucao do Node em runtime.
