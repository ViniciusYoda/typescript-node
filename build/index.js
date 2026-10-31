import buildAliasLesson, { formatLesson as formatImportedLesson, moduleName as lessonModuleName } from "./import-alias.js";
import * as LessonModule from "./import-alias.js";
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
<<<<<<< Updated upstream
const admin = {
    id: "admin-1",
    name: "Vini",
    email: "vini@example.com",
    role: "admin",
    permissions: ["users:read", "users:write"],
};
function describeAdmin(user) {
    return `${user.name} (${user.id}): ${user.permissions.join(", ")}`;
}
const auditEntry = {
    id: "audit-1",
    createdAt: new Date(),
    action: "Usuario administrador criado",
};
const profile = {
    name: "Ana",
    email: "ana@example.com",
    createdAt: new Date(),
};
const activeStatus = { status: "active" };
// & descreve requisitos de tipos; nao mescla objetos em tempo de execucao.
// Para combinar valores, usamos o spread normalmente.
const identity = { id: "member-1" };
const member = { ...identity, ...profile };
console.log("Administrador:", describeAdmin(admin));
console.log("Auditoria:", auditEntry);
console.log("Perfil com data de criacao:", profile);
console.log("Status compartilhado:", activeStatus);
console.log("Membro composto:", member);
function formatSearchId(id) {
    // Narrowing: typeof restringe o tipo dentro de cada caminho.
    // Antes da verificacao, id.toUpperCase() seria um erro: number nao tem esse metodo.
    if (typeof id === "string") {
        return id.toUpperCase();
    }
    return id.toFixed(0);
}
console.log("ID textual:", formatSearchId("user-1"));
console.log("ID numerico:", formatSearchId(42));
function notify(channel, message) {
    console.log(`Notificacao por ${channel}: ${message}`);
}
notify("email", "Seu deposito foi confirmado.");
// notify("fax", "Ola"); // Erro: "fax" nao pertence a NotificationChannel.
// null tambem pode ser uma alternativa e precisa ser tratado.
function findProfile(name) {
    return profile.name === name ? profile : null;
}
for (const name of ["Ana", "Bruno"]) {
    const foundProfile = findProfile(name);
    if (foundProfile === null) {
        console.log("Perfil nao encontrado:", name);
    }
    else {
        console.log("Email encontrado:", foundProfile.email);
    }
}
function assertNever(value) {
    throw new Error(`Comando nao tratado: ${JSON.stringify(value)}`);
}
function executeWalletCommand(user, command) {
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
const commands = [
    { kind: "deposit", currency: "credits", amount: 20 },
    { kind: "withdraw", currency: "credits", amount: 5 },
    { kind: "history" },
];
for (const command of commands) {
    executeWalletCommand(rincko, command);
}
// TIPAGEM DE FUNCOES: os parametros e o retorno fazem parte do contrato.
function calculateTotal(price, quantity) {
    return price * quantity;
}
// O retorno tambem pode ser inferido pelo TypeScript.
const applyDiscount = (total, discount) => total * (1 - discount);
// Parametro opcional: dentro da funcao, suffix pode ser string ou undefined.
function greetUser(name, suffix) {
    return suffix === undefined ? `Ola, ${name}!` : `Ola, ${name} ${suffix}!`;
}
// Parametro com valor padrao: pode ser omitido na chamada.
function calculateFee(amount, rate = 0.05) {
    return amount * rate;
}
// Rest parameters: cada argumento adicional precisa ser number.
function sumAmounts(...amounts) {
    return amounts.reduce((total, amount) => total + amount, 0);
}
const multiply = (left, right) => left * right;
// Callbacks tambem recebem tipos. Aqui a funcao e passada como argumento.
function calculate(left, right, operation) {
    return operation(left, right);
}
const logMessage = message => {
    console.log("Mensagem:", message);
};
// Genericos preservam a relacao entre os tipos de entrada e de saida.
// Com noUncheckedIndexedAccess desligado, explicitamos undefined para arrays vazios.
function firstItem(items) {
    return items[0];
}
function formatValue(value) {
    if (typeof value === "number") {
        return value.toFixed(2);
    }
    return value.map(item => item.toFixed(2));
}
// Funcoes async sempre retornam uma Promise.
async function loadUserSummary(user) {
    return { id: user.id, name: user.name };
}
const purchaseTotal = calculateTotal(25, 3);
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
console.log("Lista vazia:", firstItem([]));
// As sobrecargas permitem inferir string e string[], respectivamente.
const formattedValue = formatValue(10);
const formattedValues = formatValue([10, 20]);
console.log("Valor formatado:", formattedValue);
console.log("Valores formatados:", formattedValues);
console.log("Resumo assincrono:", await loadUserSummary(rincko));
// abstract permite compartilhar implementacao, mas impede new Account(...).
class Account {
    accountId;
    ownerName;
    // static pertence a classe, e nao a cada instancia.
    static currency = "BRL";
    // private restringe o acesso pelo TypeScript ao interior desta classe.
    currentBalance = 0;
    // Parameter properties declaram e inicializam propriedades no construtor.
    // readonly impede reatribuicao pelo TypeScript depois da inicializacao.
    constructor(accountId, ownerName) {
        this.accountId = accountId;
        this.ownerName = ownerName;
        this.renameOwner(ownerName);
    }
    // Getter: permite ler o saldo sem expor uma atribuicao direta.
    get balance() {
        return this.currentBalance;
    }
    get owner() {
        return this.ownerName;
    }
    renameOwner(name) {
        const trimmedName = name.trim();
        if (!trimmedName) {
            throw new Error("O titular nao pode ficar vazio.");
        }
        this.ownerName = trimmedName;
    }
    deposit(amount) {
        this.validateAmount(amount);
        const nextBalance = this.currentBalance + amount;
        if (!Number.isSafeInteger(nextBalance)) {
            throw new Error("O saldo ultrapassa o limite permitido.");
        }
        this.currentBalance = nextBalance;
    }
    withdraw(amount) {
        this.validateAmount(amount);
        if (amount > this.currentBalance) {
            throw new Error("Saldo insuficiente na conta.");
        }
        this.currentBalance -= amount;
    }
    // protected permite reutilizar o metodo nas subclasses.
    validateAmount(amount) {
        // Valores monetarios em centavos evitam fracionamento neste exemplo.
        if (!Number.isSafeInteger(amount) || amount <= 0) {
            throw new Error("O valor deve ser um inteiro positivo de centavos.");
        }
    }
}
// extends herda os membros e o comportamento da classe base.
class SavingsAccount extends Account {
    bankName;
    constructor(accountId, ownerName, bankName) {
        // super inicializa a classe base antes de acessar this.
        super(accountId, ownerName);
        this.bankName = bankName;
    }
    describe() {
        // ownerName e protected: esta disponivel dentro da subclasse.
        return `Poupanca de ${this.ownerName} no banco ${this.bankName}`;
    }
    creditInterest(amount) {
        this.deposit(amount);
    }
}
class CheckingAccount extends Account {
    describe() {
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
const accounts = [savingsAccount, checkingAccount];
for (const account of accounts) {
    console.log(account.describe(), "- saldo em centavos:", account.balance);
}
try {
    checkingAccount.withdraw(6_000);
}
catch (error) {
    console.log(error instanceof Error ? error.message : "Erro desconhecido.");
}
function lookupUser(input) {
    const users = [
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
function createDate(timestampOrYear, month, day) {
    if (month !== undefined && day !== undefined) {
        // O mes recebido usa 1 a 12; o construtor Date usa 0 a 11.
        return new Date(timestampOrYear, month - 1, day);
    }
    return new Date(timestampOrYear);
}
console.log("Data por timestamp:", createDate(0).toISOString());
console.log("Data por componentes:", createDate(2026, 10, 30).toLocaleDateString("pt-BR"));
function parseSetting(value) {
    if (value === "true")
        return true;
    if (value === "false")
        return false;
    return value;
}
const enabledSetting = parseSetting("true");
// Uma string cujo conteudo e desconhecido tambem pode conter "true" ou "false".
// Por isso, a assinatura ampla precisa refletir todos os retornos possiveis.
console.log("Configuracao literal:", enabledSetting);
const rawSetting = String("false");
const parsedSetting = parseSetting(rawSetting);
console.log("Configuracao dinamica:", parsedSetting);
// Use union quando as entradas compartilham o mesmo retorno e comportamento.
function displayIdentifier(id) {
    return String(id);
}
const mixedIdentifier = Math.random() > 0.5 ? "user-1" : 42;
console.log("Identificador com union:", displayIdentifier(mixedIdentifier));
// Uma entrada union exige uma assinatura publica que aceite a union completa.
// lookupUser(Math.random() > 0.5 ? rincko.id : [rincko.id]);
// Erro: nenhuma das duas sobrecargas aceita string | string[].
// lookupUser(123); // Erro: nenhuma sobrecarga aceita number.
// TYPE GUARDS: verificacoes em tempo de execucao que restringem um tipo.
function describeInput(value) {
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
function describeContact(contact) {
    if ("email" in contact) {
        return `Email: ${contact.email}`;
    }
    return `Telefone: ${contact.phone}`;
}
console.log(describeContact({ email: "ana@example.com" }));
console.log(describeContact({ phone: "11999990000" }));
// Predicado "value is Profile": informa qual tipo foi verificado no retorno true.
// unknown exige verificar os dados antes de acessar suas propriedades.
function isProfile(value) {
    // typeof null e "object", por isso null precisa ser descartado explicitamente.
    if (typeof value !== "object" || value === null) {
        return false;
    }
    return "name" in value && typeof value.name === "string"
        && "email" in value && typeof value.email === "string";
}
// O compilador confia no predicado: a implementacao deve validar todo o contrato.
// Este guard verifica o formato; nao verifica se o email e um endereco valido.
const receivedProfiles = [
    { name: "Ana", email: "ana@example.com" },
    { name: "Vini", email: "vini@example.com" },
    { name: "Sem email" },
    { name: 123, email: "invalid@example.com" },
    null,
];
// filter usa o predicado para produzir Profile[], sem assercoes com "as".
const validProfiles = receivedProfiles.filter(isProfile);
console.log("Perfis validados:", validProfiles.map(item => item.name));
function printReceivedProfile(value) {
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
function assertProfile(value) {
    if (!isProfile(value)) {
        throw new Error("O valor precisa conter name e email do tipo string.");
    }
}
const externalProfile = { name: "Carla", email: "carla@example.com" };
assertProfile(externalProfile);
console.log("Perfil apos assercao:", externalProfile.email);
try {
    assertProfile({ name: "Perfil invalido" });
}
catch (error) {
    // instanceof tambem restringe unknown no tratamento de erros.
    console.log(error instanceof Error ? error.message : "Erro desconhecido.");
}
// Evite usar apenas if (value) quando 0 ou "" forem valores validos.
function printOptionalBalance(balance) {
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
function normalizeSearch(value) {
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
function compareValues(left, right) {
    if (left === right) {
        // O unico tipo compartilhado pelas duas unions e string.
        return `Textos iguais: ${left.toUpperCase()} / ${right.toUpperCase()}`;
    }
    return `Valores diferentes: ${left} / ${right}`;
}
console.log(compareValues("ana", "ana"));
console.log(compareValues(42, false));
// != null descarta null E undefined, mas preserva 0 e strings vazias.
function describeOptionalText(text) {
    if (text != null) {
        return `Texto informado com ${text.length} caracteres`;
    }
    return "Texto ausente";
}
console.log(describeOptionalText(""));
console.log(describeOptionalText(null));
console.log(describeOptionalText(undefined));
function describeProfileState(state) {
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
const profileStates = [
    { status: "idle" },
    { status: "loading" },
    { status: "success", profile },
    { status: "error", message: "Perfil indisponivel" },
];
for (const state of profileStates) {
    console.log(describeProfileState(state));
}
// Uma atribuicao pode alterar o tipo refinado, respeitando o tipo declarado.
function demonstrateAssignment(initialValue) {
    let value = initialValue;
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
function identityValue(value) {
    return value;
}
const genericName = identityValue("Ana"); // Tipo inferido a partir do argumento.
const genericNumber = identityValue(42); // Tipo informado explicitamente.
console.log("Identidade generica:", genericName.toUpperCase(), genericNumber.toFixed(2));
// Dois parametros de tipo relacionam uma entrada a uma saida diferente.
function mapItems(items, transform) {
    return items.map(transform);
}
const profileNames = mapItems(validProfiles, item => item.name);
const nameLengths = mapItems(profileNames, name => name.length);
console.log("Mapeamento generico:", profileNames, nameLengths);
// extends restringe quais tipos podem ser usados, sem perder o tipo concreto.
function describeEntity(entity) {
    console.log("Entidade generica:", entity.id);
    return entity;
}
const describedAdmin = describeEntity(admin);
console.log("Propriedade preservada:", describedAdmin.permissions);
// describeEntity({ name: "Sem ID" }); // Erro: falta a propriedade id.
// keyof conecta uma chave ao tipo do objeto; T[K] representa o valor dessa chave.
function getProperty(object, key) {
    return object[key];
}
const selectedName = getProperty(profile, "name");
const selectedDate = getProperty(profile, "createdAt");
console.log("Propriedades genericas:", selectedName, selectedDate.toISOString());
const userPage = {
    items: [{ id: rincko.id, name: rincko.name }],
    total: 1,
};
const numberPage = { items: [10, 20, 30], total: 3 };
console.log("Paginas genericas:", userPage, numberPage);
// Cada instancia da classe fixa o tipo dos itens que pode armazenar.
class InMemoryRepository {
    items = new Map();
    save(item) {
        this.items.set(item.id, item);
    }
    findById(id) {
        return this.items.get(id);
    }
    findAll() {
        return [...this.items.values()];
    }
}
const adminRepository = new InMemoryRepository();
adminRepository.save(admin);
const storedAdmin = adminRepository.findById(admin.id);
console.log("Admin armazenado:", storedAdmin?.permissions);
console.log("Admin ausente:", adminRepository.findById("inexistente"));
console.log("Todos os admins:", adminRepository.findAll());
// adminRepository.save({ id: "incompleto" }); // Erro: faltam os membros de AdminUser.
const auditRepository = new InMemoryRepository();
auditRepository.save(auditEntry);
console.log("Auditoria armazenada:", auditRepository.findById(auditEntry.id)?.action);
// Uma union finita de chaves exige que todas estejam presentes.
const roleLabels = {
    admin: "Administrador",
    member: "Membro",
};
console.log("Rotulo do papel:", roleLabels[admin.role]);
const currencyDetails = {
    coins: { label: "Moedas", symbol: "MO" },
    credits: { label: "Creditos", symbol: "CR" },
};
function describeCurrency(currency, balance) {
    const details = currencyDetails[currency];
    return `${details.label}: ${balance} ${details.symbol}`;
}
console.log(describeCurrency("coins", rincko.wallet.coins));
console.log(describeCurrency("credits", rincko.wallet.credits));
const walletLimits = { credits: 1_000 };
function describeLimit(currency) {
    const limit = walletLimits[currency]; // number | undefined
    return limit === undefined ? "Limite nao configurado" : `Limite: ${limit}`;
}
console.log("Limite de moedas:", describeLimit("coins"));
console.log("Limite de creditos:", describeLimit("credits"));
// Readonly impede a reatribuicao das propriedades pelo TypeScript.
const rolePermissions = {
    admin: ["users:read", "users:write"],
    member: ["profile:read"],
};
console.log("Permissoes por papel:", rolePermissions.member);
// rolePermissions.member = []; // Erro: propriedade readonly.
// rolePermissions.member.push("users:write"); // Erro: array readonly.
// Com chaves abertas (string), o objeto nao contem todas as strings possiveis.
// Explicitamos undefined para acessos ausentes, mesmo sem noUncheckedIndexedAccess.
const profilesById = {
    "user-ana": { name: "Ana", email: "ana@example.com" },
};
function printProfileById(id) {
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
};
const depositLabel = transactionLabels.deposit;
console.log("Rotulo literal preservado:", depositLabel);
// Anotacao (: Tipo): verifica o valor e define o tipo da variavel como ColorPalette.
const annotatedPalette = {
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
};
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
};
// A assercao tambem faz a propriedade ser vista pelo tipo amplo ColorValue.
console.log("Paleta com as:", assertedPalette.primary);
// Uma assercao pode ocultar dados incompletos que anotacao e satisfies rejeitariam.
const incompleteProfile = { name: "Sem email" };
// O compilador acredita em string, mas o valor real e undefined.
console.log("Email real apos assercao incompleta:", incompleteProfile.email);
// const rejectedProfile: Profile = { name: "Sem email" }; // Erro: falta email.
// const checkedProfile = { name: "Sem email" } satisfies Profile; // Mesmo erro.
// Prefira um guard para dados externos em vez de assumir seu formato com as.
const incomingProfile = { name: "Dora", email: "dora@example.com" };
if (isProfile(incomingProfile)) {
    console.log("Perfil realmente verificado:", incomingProfile.email.toLowerCase());
}
// Assercao nao e conversao: o valor continua sendo string em tempo de execucao.
const textAmount = "42";
const assertedAmount = textAmount;
const convertedAmount = Number(textAmount);
console.log("Tipo real apos as:", typeof assertedAmount); // string
console.log("Conversao com Number:", typeof convertedAmount, convertedAmount); // number
// as const preserva literais e aplica readonly aos membros literais do objeto.
// Com satisfies, tambem verificamos a estrutura exigida.
const fixedPalette = {
    primary: "#3366ff",
    secondary: [255, 128, 0],
};
const primaryHex = fixedPalette.primary;
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
console.log("Casos especiais:", typeof null, typeof [], typeof (() => { }));
// null e arrays retornam "object"; use verificacao de null e Array.isArray.
// Em uma posicao de tipo, typeof obtem o tipo estatico de um valor existente.
const appSettings = {
    name: "Curso TypeScript",
    retryCount: 3,
    notificationsEnabled: true,
};
const customSettings = {
    name: "Ambiente de estudos",
    retryCount: 5,
    notificationsEnabled: false,
};
console.log("Configuracao derivada com typeof:", customSettings);
function readSetting(key) {
    return appSettings[key];
}
const retryCount = readSetting("retryCount");
const applicationName = readSetting("name");
console.log("Configuracoes por chave:", applicationName, retryCount);
// readSetting("missing"); // Erro: a chave nao existe em appSettings.
// typeof preserva o tipo ja inferido: as const torna esta lista uma tupla literal.
const supportedEnvironments = ["development", "test", "production"];
const currentEnvironment = "development";
console.log("Ambiente derivado da lista:", currentEnvironment);
// const invalidEnvironment: Environment = "staging"; // Erro: fora da union.
// Tambem podemos extrair os valores de um objeto com acesso indexado.
const httpCodes = {
    ok: 200,
    notFound: 404,
    serverError: 500,
};
const responseCode = 200;
console.log("Codigo HTTP literal:", responseCode);
// typeof em funcoes captura a assinatura, incluindo parametros e retorno.
function createNotification(recipient, message) {
    return { recipient, message, read: false };
}
const createWelcomeNotification = (recipient, message) => ({
    recipient,
    message: `Boas-vindas! ${message}`,
    read: false,
});
const notificationArguments = ["ana@example.com", "Vamos estudar typeof."];
const notificationPayload = createWelcomeNotification(...notificationArguments);
console.log("Notificacao derivada da funcao:", notificationPayload);
const course = { title: "TypeScript", lessons: 12, published: false };
const courseKey = "title";
console.log("Chave do curso:", courseKey, course[courseKey]);
const lessonKey = "lessons";
console.log("Chave extraida do valor:", course[lessonKey]);
// T[K] conecta o tipo do valor a chave escolhida.
function setCourseProperty(target, key, value) {
    target[key] = value;
}
setCourseProperty(course, "lessons", 15);
setCourseProperty(course, "published", true);
// setCourseProperty(course, "lessons", "quinze"); // Erro: lessons exige number.
// setCourseProperty(course, "price", 100); // Erro: chave inexistente.
console.log("Curso atualizado por chave:", course);
const courseSummary = { title: course.title, published: course.published };
console.log("Resumo com Pick:", courseSummary);
const courseLabels = {
    title: "Titulo",
    lessons: "Quantidade de aulas",
    published: "Publicado",
};
console.log("Rotulo de campo:", courseLabels.lessons);
const sharedLessonKey = "title";
const combinedLessonKey = "duration";
console.log("Chaves de union e intersection:", sharedLessonKey, combinedLessonKey);
// Chaves nao precisam ser strings: numeros e symbols tambem sao permitidos.
const courseTag = Symbol("courseTag");
const keyedExample = { 0: "Primeiro", name: "Exemplo", [courseTag]: "curso" };
const numericKey = 0;
const symbolKey = courseTag;
console.log("Chaves numerica e symbol:", keyedExample[numericKey], keyedExample[symbolKey]);
const indexedKey = 42;
console.log("Chave de assinatura de indice:", indexedKey);
// Object.keys retorna string[]: os objetos podem ter propriedades extras em runtime.
// Uma anotacao mais estreita nao remove essas propriedades do objeto real.
const extendedCourse = { ...course, internalCode: "TS-01" };
const courseView = extendedCourse;
console.log("Chaves reais do objeto:", Object.keys(courseView));
// Por isso, Object.keys(courseView) nao e automaticamente (keyof Course)[].
// Para iterar por um conjunto conhecido, declare explicitamente as chaves permitidas.
const visibleCourseKeys = ["title", "lessons", "published"];
for (const key of visibleCourseKeys) {
    console.log(`${courseLabels[key]}:`, courseView[key]);
}
const stringCheck = true;
const numberCheck = false;
console.log("Condicionais basicas:", stringCheck, numberCheck);
const textDescription = {
    kind: "text", value: "TypeScript", length: 10,
};
const numberDescription = { kind: "other", value: 42 };
console.log("Formatos condicionais:", textDescription, numberDescription);
const extractedCourse = course;
console.log("Elemento extraido do array:", extractedCourse.title);
const unwrappedSummary = { id: rincko.id, name: rincko.name };
console.log("Tipo extraido da Promise:", unwrappedSummary);
const textArray = ["Ana", "Vini"];
const numericArray = [10, 20];
console.log("Arrays distribuidos:", textArray, numericArray);
const mixedConditionalArray = ["Ana", 10];
console.log("Array sem distribuicao:", mixedConditionalArray);
const textOption = "published";
console.log("Union filtrada:", textOption);
const remainingOption = false;
console.log("Alternativa apos Exclude:", remainingOption);
const numericCourseKey = "lessons";
console.log("Campo numerico do curso:", course[numericCourseKey]);
// const wrongNumericKey: NumericCourseKey = "title"; // Erro: title contem string.
// Tipos condicionais desaparecem na compilacao: nao executam if nem validam valores.
// As decisoes em runtime continuam exigindo verificacoes reais, como typeof.
// NEVER: representa a ausencia de valores possiveis.
// Diferente de void (retorno ignorado), never indica que nao ha retorno normal.
function fail(message) {
    throw new Error(message);
}
function requireCourseTitle(title) {
    // Como fail nao retorna, depois de ?? o resultado so pode ser string.
    return title ?? fail("O titulo do curso e obrigatorio.");
}
console.log("Titulo obrigatorio:", requireCourseTitle("TypeScript"));
try {
    requireCourseTitle(undefined);
}
catch (error) {
    console.log(error instanceof Error ? error.message : "Erro desconhecido.");
}
// undefined e um valor real; never nao possui sequer esse valor.
function returnUndefined() {
    return undefined;
}
console.log("Retorno undefined:", returnUndefined());
function describeDelivery(delivery) {
    switch (delivery.kind) {
        case "pending":
            return "Entrega pendente";
        case "sent":
            return `Entrega enviada: ${delivery.trackingCode}`;
        case "delivered":
            return `Entrega recebida por ${delivery.receivedBy}`;
        default: {
            // Uma nova variante sem case faz esta atribuicao falhar na compilacao.
            const unhandled = delivery;
            return assertNever(unhandled);
        }
    }
}
const deliveries = [
    { kind: "pending" },
    { kind: "sent", trackingCode: "BR-123" },
    { kind: "delivered", receivedBy: "Ana" },
];
for (const delivery of deliveries) {
    console.log(describeDelivery(delivery));
}
const possibleText = "Uma union sem alternativas impossiveis";
console.log(possibleText);
const filteredValue = true;
console.log("Union sem numeros:", filteredValue);
const courseTextFields = { title: course.title };
console.log("Campos textuais do curso:", courseTextFields);
const impossibleTypeCheck = true;
const ordinaryTypeCheck = false;
const distributedTypeCheck = true;
console.log("Verificacoes de never:", impossibleTypeCheck, ordinaryTypeCheck, distributedTypeCheck);
const readonlyLesson = { id: "lesson-1", title: "Readonly" };
readonlyLesson.title = "Aprendendo readonly"; // Apenas id esta protegido.
// readonlyLesson.id = "lesson-2"; // Erro: propriedade readonly.
console.log("Propriedade readonly:", readonlyLesson);
// const impede reatribuir a variavel; readonly restringe membros do tipo.
const editableLesson = { title: "Titulo inicial" };
editableLesson.title = "Titulo atualizado"; // Permitido mesmo com const.
// editableLesson = { title: "Outro" }; // Erro: a variavel e const.
console.log("Objeto declarado com const:", editableLesson);
const shallowReadonly = {
    title: "Configuracao da aula",
    preferences: { autoplay: false },
};
// shallowReadonly.title = "Outro"; // Erro: propriedade readonly.
// shallowReadonly.preferences = { autoplay: true }; // Erro: nao pode substituir.
shallowReadonly.preferences.autoplay = true; // O objeto interno continua mutavel.
console.log("Readonly superficial:", shallowReadonly);
// Arrays readonly permitem leitura, mas nao push, splice ou atribuicao por indice.
const readonlyScores = [7, 8, 10];
const alternativeScores = readonlyScores; // Sintaxe equivalente.
// readonlyScores.push(9); // Erro: metodo de mutacao indisponivel.
// readonlyScores[0] = 0; // Erro: indice somente leitura.
// Aceitar readonly permite receber tanto arrays mutaveis quanto somente leitura.
function averageScore(values) {
    if (values.length === 0)
        return undefined;
    return values.reduce((total, value) => total + value, 0) / values.length;
}
console.log("Media do array readonly:", averageScore(alternativeScores));
console.log("Media do array mutavel:", averageScore(scores));
console.log("Media da lista vazia:", averageScore([]));
// Para ordenar sem alterar a entrada, crie uma copia mutavel.
const sortedScores = [...readonlyScores].sort((left, right) => right - left);
console.log("Copia ordenada:", sortedScores, "Original:", readonlyScores);
// Tuplas readonly preservam o contrato de posicao sem permitir alterar elementos.
const lessonPosition = [2, 3];
console.log("Tupla readonly:", lessonPosition);
// lessonPosition[0] = 5; // Erro: indice readonly.
// A visao readonly nao impede alteracoes por outra referencia mutavel.
const mutableTags = ["typescript"];
const tagView = mutableTags;
mutableTags.push("readonly");
console.log("Visao readonly apos alteracao pela origem:", tagView);
// Uma copia separa o array da origem, mas nao clona os objetos internos.
const tagSnapshot = [...mutableTags];
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
const referencedTags = ["aula"];
const literalLesson = { title: "Readonly", tags: referencedTags };
literalLesson.tags.push("referencia");
console.log("as const com referencia mutavel:", literalLesson);
// readonly nao clona nem congela objetos: descreve operacoes permitidas pelo tipo.
// AS CONST (CONST ASSERTION): preserva os valores literais de uma expressao.
let broadStatus = "draft"; // string: pode receber outros textos.
const literalStatus = "draft"; // "draft": primitivo const ja preserva o literal.
const ordinaryArticle = { status: "draft" }; // { status: string }
const constantArticle = { status: "draft" }; // { readonly status: "draft" }
broadStatus = "published";
ordinaryArticle.status = "archived";
console.log("Inferencia de literais:", broadStatus, literalStatus, ordinaryArticle, constantArticle);
// constantArticle.status = "published"; // Erro: propriedade readonly.
// Objetos e arrays literais aninhados tambem recebem tipos readonly.
const articleDefaults = {
    status: "draft",
    editor: { theme: "dark" },
    tags: ["typescript", "study"],
};
// articleDefaults.editor.theme = "light"; // Erro: propriedade readonly.
// articleDefaults.tags.push("new"); // Erro: tupla readonly.
console.log("Literais aninhados:", articleDefaults);
// Um array literal vira uma tupla readonly com tipos e posicoes exatos.
const articleEntry = ["article-1", 10]; // readonly ["article-1", 10]
function describeArticleEntry(entry) {
    return `${entry[0]}: ${entry[1]} visualizacoes`;
}
console.log("Tupla com as const:", describeArticleEntry(articleEntry));
// Uma lista de valores pode ser a fonte unica de uma union.
const articleStatuses = ["draft", "published", "archived"];
function publishArticle(status) {
    console.log("Status aceito:", status);
}
publishArticle("published");
// publishArticle("deleted"); // Erro: literal fora da union.
// Sem as const, kind seria inferido como string no retorno desta funcao.
function createArticlePublishedEvent(articleId) {
    return { kind: "article:published", articleId };
}
function createArticleArchivedEvent(articleId) {
    return { kind: "article:archived", articleId };
}
function handleArticleEvent(event) {
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
const articleRoutes = {
    list: { path: "/articles", method: "GET" },
    create: { path: "/articles", method: "POST" },
};
const listMethod = articleRoutes.list.method;
console.log("Rota validada com literais:", listMethod, articleRoutes.list.path);
// A assercao deve ser aplicada ao literal, nao a uma variavel ja inferida.
const previouslyInferred = { status: "draft" }; // status: string
// const tooLate = previouslyInferred as const; // Erro: nao e uma expressao literal.
console.log("Tipo amplo permanece:", previouslyInferred.status);
// Para uma condicao, aplique as const em cada literal, se necessario.
const binaryChoice = Math.random() > 0.5 ? 0 : 1; // 0 | 1
console.log("Union de literais condicionais:", binaryChoice);
const articleDetails = {
    id: "article-pick-1",
    title: "Aprendendo Pick",
    content: "Pick permite reutilizar partes de um tipo existente.",
    author: { name: "Ana", email: "ana@example.com" },
};
const articlePreview = {
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
function renderArticleHeading(article) {
    return article.subtitle === undefined
        ? article.title
        : `${article.title}: ${article.subtitle}`;
}
console.log("Cabecalho da previa:", renderArticleHeading(articlePreview));
console.log("Cabecalho do artigo completo:", renderArticleHeading(articleDetails));
// Pick altera apenas o tipo: nao remove propriedades do objeto em runtime.
const previewView = articleDetails;
console.log("Mesmo objeto:", previewView === articleDetails);
console.log("Chaves reais da visao:", Object.keys(previewView));
// previewView.content; // Erro de tipo, embora content ainda exista no objeto real.
// Para selecionar valores em runtime, uma funcao precisa construir um novo objeto.
function pickProperties(source, keys) {
    // O objeto comeca vazio; a assercao representa o resultado completo do loop.
    const selected = {};
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
const titleUpdate = { title: "Novo titulo" };
const requiredHeading = { title: "Pick", subtitle: "Exemplos praticos" };
console.log("Atualizacao parcial:", titleUpdate);
console.log("Cabecalho obrigatorio:", renderArticleHeading(requiredHeading));
function createStudyArticle(input) {
    return { ...input, id: crypto.randomUUID() };
}
const createdArticle = createStudyArticle({
    title: "Aprendendo Omit",
    content: "Reutilizando tipos sem os campos gerados pelo sistema.",
    author: { name: "Vini", email: "vini@example.com" },
});
console.log("Artigo criado sem informar id:", createdArticle);
const articleCard = { id: createdArticle.id, title: createdArticle.title };
articleCard.subtitle = "Cartao sem conteudo e autor";
// articleCard.id = "outro"; // Erro: readonly foi preservado.
console.log("Cartao com Omit:", articleCard);
const articleEdit = { title: "Titulo revisado" };
console.log("Edicao parcial sem id e autor:", articleEdit);
// Para realmente retirar dados, construimos um objeto em tempo de execucao.
const publicArticle = {
    ...createdArticle,
    author: { name: createdArticle.author.name },
};
console.log("Autor sem email no objeto real:", publicArticle.author);
// Omit<ArticleDetails, "author.email"> nao remove o email aninhado.
// Uma anotacao Omit nao apaga propriedades do objeto existente.
const articleCardView = createdArticle;
console.log("Visao continua sendo o mesmo objeto:", articleCardView === createdArticle);
console.log("Campos reais da visao:", Object.keys(articleCardView));
// articleCardView.content; // Erro de tipo; o dado ainda existe em runtime.
// Rest destructuring cria um novo objeto sem as propriedades extraidas.
const { content: removedContent, author: removedAuthor, ...articleWithoutContent } = createdArticle;
console.log("Campos realmente removidos:", removedContent.length, removedAuthor.name);
console.log("Cartao criado em runtime:", articleWithoutContent);
const articleWithAuthorName = {
    ...createdArticle,
    author: createdArticle.author.name,
};
console.log("Autor convertido para nome:", articleWithAuthorName.author.toUpperCase());
const strictArticleCard = articleCard;
console.log("Omit com chaves restritas:", strictArticleCard.title);
const studyPreferences = {
    theme: "light",
    dailyMinutes: 30,
    notifications: { email: true, push: false },
};
const preferencesPatch = { theme: "dark" };
const emptyPreferencesPatch = {}; // Nenhum campo e obrigatorio.
console.log("Patches com Partial:", preferencesPatch, emptyPreferencesPatch);
// const invalidPatch: Partial<StudyPreferences> = { dailyMinutes: "30" }; // Tipo incorreto.
// Propriedades opcionais exigem tratamento de undefined durante a leitura.
function describePreferencesPatch(patch) {
    return patch.dailyMinutes === undefined
        ? "Tempo de estudo nao alterado"
        : `Novo tempo: ${patch.dailyMinutes} minutos`;
}
console.log(describePreferencesPatch(preferencesPatch));
console.log(describePreferencesPatch({ dailyMinutes: 45 }));
// Partial e um tipo: a funcao ainda precisa implementar como aplicar as mudancas.
function updatePreferences(current, patch) {
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
const notificationReplacement = {
    notifications: { email: false, push: true },
};
console.log("Substituicao do objeto interno:", updatePreferences(studyPreferences, notificationReplacement));
function updateNestedPreferences(current, patch) {
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
const schedulePatch = { dailyMinutes: 60 };
console.log("Atualizacao de campos selecionados:", schedulePatch);
const identifiedArticlePatch = { id: createdArticle.id, title: "Partial na pratica" };
console.log("Patch com identificador obrigatorio:", identifiedArticlePatch);
// const missingPatchId: IdentifiedArticlePatch = { title: "Sem id" }; // Erro: falta id.
// Partial preserva readonly: tornar opcional nao torna uma propriedade editavel.
const optionalArticleId = { id: createdArticle.id };
console.log("ID opcional e readonly:", optionalArticleId.id);
const completeStudyOptions = {
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
const optionsWithEmptyReminders = {
    ...completeStudyOptions,
    reminders: {},
};
console.log("Objeto interno ainda opcional:", optionsWithEmptyReminders.reminders.email);
// O tipo nao preenche valores: esta funcao implementa os padroes em runtime.
function resolveStudyOptions(options) {
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
const studyIdentity = { courseId: "ts-2", theme: "light" };
console.log("Campos selecionados obrigatorios:", studyIdentity);
const optionsWithCourseId = { courseId: "ts-3" };
console.log("Somente courseId obrigatorio:", optionsWithCourseId);
// const missingCourseId: OptionsWithCourseId = { theme: "dark" }; // Erro: falta courseId.
// Required e Partial alteram a obrigatoriedade das propriedades no primeiro nivel.
const restoredPreferences = studyPreferences;
console.log("Propriedades obrigatorias novamente:", restoredPreferences);
const requiredContact = { email: null }; // null permanece permitido.
const emptyContact = { email: "" }; // Conteudo nao e validado.
console.log("Campo presente com null:", requiredContact);
console.log("Campo presente com string vazia:", emptyContact);
const editableArticleStatus = "draft";
console.log("Status sem archived:", editableArticleStatus);
const remainingScalar = 42;
console.log("Union apos varias exclusoes:", remainingScalar);
const presentScalar = false;
console.log("Valor nao nulo preservado:", presentScalar);
const stillAllowedText = "archived";
console.log("Literal dentro de string ampla:", stillAllowedText);
function describeBalanceCommand(command) {
    return `${command.kind}: ${command.amount} ${command.currency}`;
}
console.log("Comando sem history:", describeBalanceCommand({
    kind: "deposit", currency: "coins", amount: 10,
}));
const completeCourseAfterExclude = course;
const courseWithoutTitle = { lessons: 15, published: true };
console.log("Exclude preservou o objeto:", completeCourseAfterExclude.title);
console.log("Omit removeu a chave do tipo:", courseWithoutTitle);
const courseMetrics = { lessons: course.lessons, published: course.published };
console.log("Chaves filtradas com Exclude:", courseMetrics);
// Exclude nao altera arrays em runtime: filter precisa executar a verificacao.
function isEditableArticleStatus(status) {
    return status !== "archived";
}
const editableStatuses = articleStatuses.filter(isEditableArticleStatus);
console.log("Status filtrados em runtime:", editableStatuses);
console.log("Lista original preservada:", articleStatuses);
const allStatusesExcluded = true;
console.log("Exclusao completa resulta em never:", allStatusesExcluded);
const archivedOnly = "archived";
console.log("Alternativa mantida com Extract:", archivedOnly);
const displayName = "Ana";
console.log("Nome nao nulo:", displayName);
const presentSettings = ["", 0, false];
console.log("Valores validos preservados:", presentSettings);
// O utilitario altera o tipo, mas nao transforma nem verifica um valor real.
function requirePresent(value) {
    if (value === null || value === undefined) {
        throw new Error("O valor nao pode ser null nem undefined.");
    }
    // A verificacao permite retornar o valor refinado sem usar as.
    return value;
}
const possiblyMissingName = profileNames.find(name => name === "Ana");
console.log("Nome verificado em runtime:", requirePresent(possiblyMissingName));
try {
    requirePresent(null);
}
catch (error) {
    console.log(error instanceof Error ? error.message : "Erro desconhecido.");
}
// Um predicado generico permite filtrar null e undefined de arrays.
function isPresent(value) {
    return value !== null && value !== undefined;
}
const nullableScores = [0, 7, null, 10, undefined];
const presentScores = nullableScores.filter(isPresent);
console.log("Notas presentes, incluindo zero:", presentScores);
const presentReminders = {}; // email e push ainda sao opcionais.
console.log("Objeto presente com campos opcionais:", presentReminders);
const contactCard = { name: null };
console.log("Objeto nao nulo com campo nulo:", contactCard);
const completeContactCard = { name: "Ana", email: "ana@example.com" };
console.log("Campos obrigatorios e nao nulos:", completeContactCard);
const contactWithNull = { email: null };
const contactWithoutNull = { email: "vini@example.com" };
console.log("Required permite null:", contactWithNull);
console.log("NonNullable aplicado ao campo:", contactWithoutNull);
const noPresentValueCheck = true;
console.log("Sem valores nao nulos:", noPresentValueCheck);
const visibleArticleStatus = "published";
console.log("Status selecionado com Extract:", visibleArticleStatus);
const extractedText = "TypeScript";
console.log("Membro textual extraido:", extractedText);
const broadStringCheck = true;
const literalFromUnion = "draft";
console.log("Compatibilidade em Extract:", broadStringCheck, literalFromUnion);
const extractedDeposit = { kind: "deposit", currency: "coins", amount: 25 };
const extractedWithdrawal = { kind: "withdraw", currency: "credits", amount: 5 };
console.log("Variante de deposito:", extractedDeposit);
console.log("Variante com valor:", extractedWithdrawal);
// AmountCommand mantem deposit e withdraw; history nao possui amount.
// Um predicado executa a verificacao real para filtrar os valores de um array.
function isDepositCommand(command) {
    return command.kind === "deposit";
}
const depositCommands = commands.filter(isDepositCommand);
console.log("Depositos filtrados em runtime:", depositCommands);
const sharedCourseCard = { title: course.title, published: course.published };
console.log("Campos com chaves compartilhadas:", sharedCourseCard);
const selectedArticleEvent = "article:published";
console.log("Evento selecionado por prefixo:", selectedArticleEvent);
const selectedNumber = 10;
const remainingNonNumber = false;
console.log("Extract e Exclude:", selectedNumber, remainingNonNumber);
const noMatchingStatusCheck = true;
console.log("Nenhum membro correspondente:", noMatchingStatusCheck);
const courseFlags = {
    title: true,
    lessons: false,
    published: true,
};
console.log("Campos transformados em flags:", courseFlags);
const mappedReadonlyCourse = { ...course };
// mappedReadonlyCourse.title = "Outro"; // Erro: propriedade readonly.
const mutableArticlePreview = { ...articlePreview };
mutableArticlePreview.id = "preview-editable"; // -readonly permite reatribuir id.
const optionalCourseFields = { title: "Mapped types" };
const requiredPreviewFields = {
    id: "preview-required",
    title: "Todos os campos presentes",
    subtitle: "O modificador -? remove a opcionalidade",
};
console.log("Mapeamento readonly:", mappedReadonlyCourse);
console.log("Modificador readonly removido:", mutableArticlePreview);
console.log("Campos opcionais:", optionalCourseFields);
console.log("Campos obrigatorios:", requiredPreviewFields);
const wrappedPreview = {
    id: { value: "wrapped-1" },
    title: { value: "Valores encapsulados" },
    // subtitle continua opcional; id continua readonly no primeiro nivel.
};
wrappedPreview.id.value = "wrapped-2"; // O objeto interno nao foi tornado readonly.
console.log("Valores transformados com modificadores preservados:", wrappedPreview);
const courseGetters = {
    getTitle: () => course.title,
    getLessons: () => course.lessons,
    getPublished: () => course.published,
};
console.log("Chaves renomeadas:", courseGetters.getTitle(), courseGetters.getLessons());
const textualCourse = { title: course.title };
console.log("Propriedades filtradas pelo valor:", textualCourse);
const articleEventHandlers = {
    "article:published": event => `Publicacao processada: ${event.articleId}`,
    "article:archived": event => `Arquivamento processado: ${event.articleId}`,
};
console.log(articleEventHandlers["article:published"](createArticlePublishedEvent("mapped-1")));
console.log(articleEventHandlers["article:archived"](createArticleArchivedEvent("mapped-2")));
const inferredScore = 10; // number
const inferredStatus = "draft"; // Union de literais.
console.log("Elementos capturados com infer:", inferredScore, inferredStatus);
const inferredArguments = [25, 3];
const inferredResult = calculateTotal(...inferredArguments);
console.log("Parametros e retorno inferidos:", inferredArguments, inferredResult);
// Parameters<T> e ReturnType<T> sao os utilitarios nativos para essas tarefas.
// Em funcoes com overload, essa extracao considera a ultima assinatura publica.
const inferredOverloadArguments = [2026, 10, 30];
console.log("Parametros do ultimo overload:", inferredOverloadArguments);
const inferredHead = "article-1";
const inferredTail = [10];
console.log("Cabeca e cauda da tupla:", inferredHead, inferredTail);
const resolvedSummary = { id: rincko.id, name: rincko.name };
console.log("Resultado de extracao recursiva:", resolvedSummary);
const inferredEventParts = {
    domain: "article",
    action: "published",
};
console.log("Partes extraidas do literal:", inferredEventParts);
const firstTextItem = "TypeScript";
const rejectedFirstItem = true;
console.log("Infer com restricao:", firstTextItem, rejectedFirstItem);
const inferredUnionItems = ["Ana", 42];
console.log("Extracao distribuida:", inferredUnionItems);
// infer so e permitido na clausula extends de um tipo condicional.
// Nao inspeciona valores em runtime nem substitui validacao de dados externos.
// DECLARE E .D.TS: descrevem valores e contratos sem gerar sua implementacao.
// study-runtime.d.ts declara StudyRuntime e globalThis.studyRuntime para o projeto.
// O import type no inicio deste arquivo desaparece do JavaScript compilado.
const runtimeOptions = { prefix: "[Estudos TypeScript]" };
// A declaracao nao cria o valor: esta atribuicao fornece a implementacao real.
globalThis.studyRuntime = {
    version: "1.0.0",
    log(message) {
        console.log(`${runtimeOptions.prefix} ${message}`);
    },
};
function reportStudyRuntime() {
    const runtime = globalThis.studyRuntime;
    if (runtime === undefined) {
        console.log("Runtime de estudos ainda nao inicializado.");
        return;
    }
    runtime.log(`Runtime inicializado, versao ${runtime.version}`);
}
reportStudyRuntime();
// Se o identificador nao existir em runtime, typeof permite verificar sem ReferenceError.
if (typeof STUDY_BUILD_LABEL !== "undefined") {
    console.log("Rotulo fornecido pelo ambiente:", STUDY_BUILD_LABEL.toUpperCase());
}
else {
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
const aliasLesson = {
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
=======
const userTuple = [myName, age, isActive];
userTuple[1] = 26; // Uma tupla mutavel permite alterar o valor do mesmo tipo.
const [tupleName, tupleAge, tupleActive] = userTuple;
console.log("Tupla de usuario:", tupleName, tupleAge, tupleActive);
const contactWithoutPhone = [myName, "vini@example.com"];
const contactWithPhone = [myName, "vini@example.com", "11999999999"];
function formatContact([name, email, phone]) {
    return `${name} <${email}> | ${phone ?? "Telefone nao informado"}`;
}
console.log(formatContact(contactWithoutPhone));
console.log(formatContact(contactWithPhone));
// readonly bloqueia alteracoes via TypeScript, sem congelar o valor em runtime.
const walletSnapshot = ["credits", rincko.wallet.credits];
// walletSnapshot[1] = 0; // Erro: indice somente de leitura.
console.log("Snapshot da carteira:", formatBalance(walletSnapshot));
// as const infere uma tupla readonly com os valores literais.
const initialPosition = [0, 0];
console.log("Posicao inicial:", initialPosition);
function calculateAverage([student, ...grades]) {
    if (grades.length === 0) {
        return `${student}: sem notas`;
    }
    const average = grades.reduce((total, grade) => total + grade, 0) / grades.length;
    return `${student}: media ${average.toFixed(2)}`;
}
console.log(calculateAverage([myName, ...scores]));
console.log(calculateAverage(["Ana"]));
const sumArguments = [10, 20];
console.log("Soma com spread:", sum(...sumArguments));
function lookupUserTuple(id) {
    const result = findUser(id);
    return result.success ? [true, result.data] : [false, result.error];
}
for (const id of [rincko.id, "inexistente"]) {
    const [success, value] = lookupUserTuple(id);
    if (success) {
        // O discriminante permite reconhecer value como UserSummary.
        console.log("Usuario pela tupla:", value.name);
    }
    else {
        console.log("Erro pela tupla:", value.toUpperCase());
    }
}
// ENUM: agrupa constantes nomeadas e tambem existe em tempo de execucao.
// Enum numerico: o primeiro valor e 0; os seguintes incrementam em 1.
var AccessLevel;
(function (AccessLevel) {
    AccessLevel[AccessLevel["Guest"] = 0] = "Guest";
    AccessLevel[AccessLevel["Member"] = 1] = "Member";
    AccessLevel[AccessLevel["Admin"] = 2] = "Admin";
})(AccessLevel || (AccessLevel = {}));
const accessLevel = AccessLevel.Member;
console.log("Nivel numerico:", accessLevel); // 1
console.log("Nome pelo valor:", AccessLevel[accessLevel]); // "Member"
// Valores numericos explicitos sao uteis para codigos conhecidos.
var HttpStatus;
(function (HttpStatus) {
    HttpStatus[HttpStatus["Ok"] = 200] = "Ok";
    HttpStatus[HttpStatus["NotFound"] = 404] = "NotFound";
    HttpStatus[HttpStatus["InternalServerError"] = 500] = "InternalServerError";
})(HttpStatus || (HttpStatus = {}));
console.log("Status HTTP:", HttpStatus.Ok, HttpStatus.NotFound, HttpStatus.InternalServerError);
// Enum de string: cada membro precisa de um valor explicito.
// Nao possui o mapeamento reverso automatico dos enums numericos.
var AccountStatus;
(function (AccountStatus) {
    AccountStatus["Pending"] = "pending";
    AccountStatus["Active"] = "active";
    AccountStatus["Suspended"] = "suspended";
})(AccountStatus || (AccountStatus = {}));
// Record exige um rotulo para cada membro do enum.
const accountStatusLabels = {
    [AccountStatus.Pending]: "Aguardando ativacao",
    [AccountStatus.Active]: "Conta ativa",
    [AccountStatus.Suspended]: "Conta suspensa",
};
function describeAccountStatus(status) {
    // O never ajuda a detectar um membro novo que ainda nao foi tratado.
    switch (status) {
        case AccountStatus.Pending:
            return "Ative a conta para realizar operacoes.";
        case AccountStatus.Active:
            return "A conta pode realizar operacoes.";
        case AccountStatus.Suspended:
            return "As operacoes da conta estao bloqueadas.";
        default: {
            const unexpectedStatus = status;
            throw new Error(`Status inesperado: ${unexpectedStatus}`);
        }
    }
}
const account = {
    user: { id: rincko.id, name: rincko.name },
    status: AccountStatus.Pending,
};
console.log(accountStatusLabels[account.status], describeAccountStatus(account.status));
account.status = AccountStatus.Active;
console.log(accountStatusLabels[account.status], describeAccountStatus(account.status));
// account.status = "active"; // Erro: use AccountStatus.Active.
// Dados externos precisam de validacao; uma assercao nao valida o valor.
function isAccountStatus(value) {
    return typeof value === "string"
        && Object.values(AccountStatus).some(status => status === value);
}
for (const receivedStatus of ["suspended", "invalid", 123]) {
    if (isAccountStatus(receivedStatus)) {
        console.log("Status externo valido:", accountStatusLabels[receivedStatus]);
    }
    else {
        console.log("Status externo invalido:", receivedStatus);
    }
}
const literalStatus = "active";
console.log("Uniao literal:", literalStatus);
console.log("Valores do enum de string:", Object.values(AccountStatus));
export {};
>>>>>>> Stashed changes
