export const moduleName = "Modulo de aulas";
export function formatLesson(lesson) {
    return `${lesson.title} (${lesson.durationMinutes} minutos)`;
}
// Uma exportacao default pode receber qualquer nome local no import.
export default function createLesson(title, durationMinutes) {
    return { title, durationMinutes };
}
