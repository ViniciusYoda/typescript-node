// .d.ts descreve contratos de tipos e nao gera implementacao JavaScript.
// export {} torna este arquivo um modulo e delimita o alcance das declaracoes.
export {};

declare global {
    // Interfaces globais podem descrever o contrato de um ambiente hospedeiro.
    interface StudyRuntime {
        readonly version: string;
        log(message: string): void;
    }

    // declare informa ao compilador que o valor pode ser fornecido pelo ambiente.
    // undefined representa a possibilidade de ainda nao ter sido inicializado.
    // var permite acessar a declaracao como propriedade de globalThis.
    var studyRuntime: StudyRuntime | undefined;
}

// Tipos exportados podem ser importados com import type, sem import em runtime.
export interface StudyRuntimeOptions {
    prefix: string;
}
