import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { tasks, userName } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "PLACEHOLDER_API_KEY") {
      return NextResponse.json({
        advice:
          "Zen Coach está meditando (API Key pendiente). Enfócate en tu tarea de mayor prioridad.",
      });
    }

    const client = new GoogleGenAI({ apiKey });

    const highPriorityTasks = (tasks || [])
      .slice(0, 3)
      .map(
        (t: { title: string; calculatedPriority: number }) =>
          `- ${t.title} (Score: ${t.calculatedPriority})`
      )
      .join("\n");

    const prompt = `
      Eres Zennyth, un coach de productividad sabio y calmado para un estudiante universitario llamado ${userName || "Estudiante"}.
      Estas son sus top 3 tareas por prioridad WSJF:
      ${highPriorityTasks || "- Sin tareas pendientes"}

      Responde en español. Da un párrafo corto (máximo 80 palabras):
      1. Reconoce su carga de trabajo brevemente.
      2. Da una estrategia específica para la tarea más importante.
      3. Termina con una frase zen/motivacional.
    `;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return NextResponse.json({
      advice:
        response.text ||
        "Enfócate en el momento presente. Tus tareas son manejables.",
    });
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({
      advice:
        "El camino no está claro ahora, pero tu potencial es ilimitado. Empieza con la primera tarea.",
    });
  }
}
