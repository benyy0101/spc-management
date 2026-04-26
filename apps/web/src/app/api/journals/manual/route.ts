import { NextRequest, NextResponse } from "next/server";
import { createManualJournal } from "@/lib/api/journal-operations";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const result = await createManualJournal(payload);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "proxy_error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
