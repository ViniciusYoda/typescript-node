// Exportacoes nomeadas: quem importa pode escolher um apelido local com "as".
export interface LessonInfo {
    title: string;
    durationMinutes: number;
}

export const moduleName = "Modulo de aulas";

export function formatLesson(lesson: LessonInfo): string {
    return `${lesson.title} (${lesson.durationMinutes} minutos)`;
}

// Uma exportacao default pode receber qualquer nome local no import.
export default function createLesson(title: string, durationMinutes: number): LessonInfo {
    return { title, durationMinutes };
}
