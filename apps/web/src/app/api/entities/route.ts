import { NextRequest, NextResponse } from "next/server";
import { createEntity, listEntities } from "@/lib/api/reference";

export async function GET(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get("tenantId");
  if (!tenantId) {
    return NextResponse.json({ error: "validation_error", message: "tenantId is required" }, { status: 400 });
  }

  try {
    const result = await listEntities(tenantId);
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

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const result = await createEntity(payload);
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
