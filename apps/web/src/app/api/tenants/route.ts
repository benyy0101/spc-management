import { NextResponse } from "next/server";
import { listTenants } from "@/lib/api/reference";

export async function GET() {
  try {
    const result = await listTenants();
    return NextResponse.json(result);
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
