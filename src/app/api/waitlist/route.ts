import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Simple file-based waitlist for smoke test validation.
// Replace with a database when you have one.
const WAITLIST_FILE = path.join(process.cwd(), ".waitlist.json");

async function getWaitlist(): Promise<{ email: string; at: string }[]> {
  try {
    const data = await fs.readFile(WAITLIST_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    const waitlist = await getWaitlist();

    if (waitlist.some((e) => e.email === email)) {
      return NextResponse.json({ message: "Ya estás en la lista", count: waitlist.length });
    }

    waitlist.push({ email, at: new Date().toISOString() });
    await fs.writeFile(WAITLIST_FILE, JSON.stringify(waitlist, null, 2));

    return NextResponse.json({
      message: "Te agregamos a la lista",
      count: waitlist.length,
    });
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "Error al registrar" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const waitlist = await getWaitlist();
  return NextResponse.json({ count: waitlist.length });
}
