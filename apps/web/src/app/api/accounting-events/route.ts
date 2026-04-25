import { NextRequest, NextResponse } from "next/server";
import { createAccountingEvent } from "@/lib/api/events";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const result = await createAccountingEvent(payload);
    return NextResponse.json(result, { status: result.skippedAsDuplicate ? 200 : 201 });
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
