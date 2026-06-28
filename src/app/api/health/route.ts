import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`

    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        services: { database: "ok" },
      },
      { status: 200 }
    )
  } catch {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        services: { database: "unreachable" },
      },
      { status: 503 }
    )
  }
}
