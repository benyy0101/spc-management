import { NextRequest, NextResponse } from "next/server";
import { createClosePeriod } from "@/lib/api/close-periods";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const result = await createClosePeriod(payload);
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
