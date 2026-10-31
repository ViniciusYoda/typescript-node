# API com Fastify e TypeScript

API didatica de usuarios e carteiras. Requer Node.js 24.12 ou superior.
Os dados ficam em memoria e sao perdidos ao reiniciar. Nao possui autenticacao.

## Executar

A API usa o suporte nativo de TypeScript do Node: `npm start` executa
`node src/server.ts`, sem tsx e sem build previo. Imports locais incluem a extensao,
por exemplo `import { buildApp } from "./app.ts"`. Imports apenas de tipos usam
`import type`.

O Node remove as anotacoes de tipos, mas nao verifica tipos nem le o tsconfig.
Continue usando `npm run typecheck`. A configuracao `erasableSyntaxOnly` impede
na API construcoes que exigem transformacao, como enums e propriedades de
parametros de construtor. As aulas anteriores continuam usando tsx separadamente.
Referencia: [TypeScript no Node.js](https://nodejs.org/api/typescript.html).

```sh
npm install
npm run dev
```

Servidor: `http://127.0.0.1:3000`. Configure `PORT` e `HOST` pelas variaveis de ambiente.
Para carregar um arquivo de configuracao, copie `.env.example` para `.env` e use
`node --env-file=.env src/server.ts`. Os comandos npm usam o ambiente do processo.

```sh
npm run typecheck
npm test
npm run build
npm start
```

Para validar toda a API de uma vez, execute `npm run verify`: verificacao dos tipos
da API e dos testes, testes nativos, build e testes do JavaScript gerado.
Para executar o resultado do build, use `npm run start:build`.

As aulas anteriores continuam disponiveis com `npm run study`.
O arquivo de aulas contem marcadores de conflito preexistentes que precisam ser
resolvidos antes de executar esse comando. O build da API compila apenas `app.ts`
e `server.ts`, preservando o material de estudo.

## Rotas

| Metodo | Rota | Descricao |
| --- | --- | --- |
| GET | /health | Estado do servidor |
| GET | /users | Lista usuarios |
| POST | /users | Cria usuario com `{ "name": "Vini" }` |
| GET | /users/:id | Busca usuario |
| PATCH | /users/:id | Atualiza nome com `{ "name": "Vinicius" }` |
| DELETE | /users/:id | Remove usuario e historico |
| GET | /users/:id/transactions | Lista transacoes |
| POST | /users/:id/transactions | Deposita ou saca moedas/creditos |

Exemplo em PowerShell:

```powershell
$user = Invoke-RestMethod http://127.0.0.1:3000/users -Method Post -ContentType 'application/json' -Body '{"name":"Vini"}'
Invoke-RestMethod "http://127.0.0.1:3000/users/$($user.id)/transactions" -Method Post -ContentType 'application/json' -Body '{"kind":"deposit","currency":"credits","amount":100}'
Invoke-RestMethod "http://127.0.0.1:3000/users/$($user.id)"
```

Transacoes aceitam `kind` (`deposit` ou `withdraw`), `currency` (`coins` ou `credits`)
e `amount` (inteiro positivo seguro). Valores invalidos retornam 400, recursos
inexistentes 404 e saldo insuficiente 409. Operacoes rejeitadas nao alteram o saldo.

## Organizacao

- `src/app.ts`: cria a aplicacao, registra rotas, schemas e armazenamento isolado.
- `src/server.ts`: configura endereco e porta e encerra o servidor pelos sinais do processo.
- `tests/app.test.ts`: testes HTTP com `app.inject`, sem abrir portas.
- `src/index.ts`: exemplos anteriores de TypeScript.

Referencia: [documentacao do Fastify](https://fastify.dev/docs/latest/).

## Compilacao, transpilacao e build

Transpilacao converte TypeScript em JavaScript: anotacoes de tipos e interfaces
desaparecem, enquanto construcoes com efeito em runtime, como enums, geram codigo.
Isso nao substitui a verificacao de tipos. Neste projeto, o build combina limpeza,
verificacao de tipos e emissao de JavaScript executavel pelo Node.js.

| Comando | Finalidade | Saida |
| --- | --- | --- |
| `npm run dev` | Executa TS nativamente com Node e reinicia ao editar; nao verifica tipos | Sem arquivos de build |
| `npm run typecheck` | Verifica tipos, sem emitir JavaScript | Diagnosticos |
| `npm run transpile` | Emite JS sem verificacao completa dos tipos (`--noCheck`) | `dist-transpiled/` |
| `npm run build` | Limpa saidas e compila com verificacao dos tipos | `dist/` |
| `npm run build:watch` | Recompila a API ao editar, sem reiniciar o servidor | `dist/` |
| `npm start` | Executa src/server.ts diretamente com Node.js | Servidor HTTP |
| `npm run start:build` | Executa o build pronto com Node.js | Servidor HTTP |
| `npm run test:build` | Faz build e testa o JavaScript gerado | Resultado dos testes |
| `npm run clean` | Remove somente `dist/` e `dist-transpiled/` | Pastas geradas removidas |

`tsconfig.json` define a verificacao da API com `noEmit: true`.
`tsconfig.build.json` herda essas regras e habilita a emissao. `noEmitOnError`
impede gerar um novo build quando existem erros de tipos; o comando build limpa
as saidas primeiro para evitar executar arquivos de uma compilacao anterior.
No modo watch, um erro preserva o ultimo JavaScript emitido com sucesso.

O alvo `ES2023` fixa a versao da sintaxe gerada. `NodeNext` e `"type": "module"`
mantem o uso de ESM. Os imports locais no TypeScript usam extensao `.ts`; no build,
`rewriteRelativeImportExtensions` converte esses imports para `.js`. O compilador nao
agrupa dependencias nem adiciona polyfills: instale as dependencias de runtime.

```text
src/app.ts     -> dist/app.js     + dist/app.js.map
src/server.ts  -> dist/server.js  + dist/server.js.map
```

Source maps permitem relacionar erros no JavaScript com as linhas TypeScript.
`npm run start:build` ativa esse suporte com `--enable-source-maps`. O build inclui os fontes
nos mapas para depuracao. A pasta antiga `build/` e preservada, mas nao e mais usada.

Fluxo para verificar e executar:

```sh
npm run typecheck
npm test
npm run test:build
npm start
```

`npm run transpile` e um exemplo de emissao sem verificacao completa; nao e a
validacao de entrega. `npm run start:build` usa o build verificado em `dist/`.
Referencia: [opcoes do compilador TypeScript](https://www.typescriptlang.org/tsconfig/).
