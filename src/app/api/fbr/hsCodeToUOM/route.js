import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const hsCode = searchParams.get("hsCode");
    const authHeader =
      request.headers.get("authorization") ||
      request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization header required" },
        { status: 401 },
      );
    }
    const token = authHeader.replace(/^Bearer\s+/i, "");
    //console.log("Using token:", token);
    const response = await fetch(
      `https://gw.fbr.gov.pk/pdi/v2/HS_UOM?hs_code=${hsCode}&annexure_id=3`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { message: "HS Code to UOM API failed", status: response.status },
        { status: response.status },
      );
    }

    const data = await response.json();

    return NextResponse.json(Array.isArray(data) ? data : [], { status: 200 });
  } catch (err) {
    console.warn("HS Code to UOM fetch failed:", err);
    return NextResponse.json([], { status: 500 });
  }
}
