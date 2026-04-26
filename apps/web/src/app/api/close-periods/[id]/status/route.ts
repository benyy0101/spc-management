import { NextRequest, NextResponse } from "next/server";
import { updateClosePeriodStatus } from "@/lib/api/close-periods";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const tenantId = request.nextUrl.searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json(
        {
          error: "invalid_request",
          message: "tenantId query parameter is required",
        },
        { status: 400 },
      );
    }

    const payload = await request.json();
    const result = await updateClosePeriodStatus(tenantId, id, payload);
    return NextResponse.json(result, { status: 200 });
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
