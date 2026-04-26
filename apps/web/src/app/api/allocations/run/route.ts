import { NextRequest, NextResponse } from "next/server";
import { runAllocations } from "@/lib/api/allocations";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const result = await runAllocations(payload);
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
