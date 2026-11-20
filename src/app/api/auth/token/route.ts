import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");

export async function POST() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    console.error("JWT issuance failed: BETTER_AUTH_SECRET is not configured");
    return NextResponse.json({ success: false, message: "Authentication is not configured" }, { status: 500 });
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ success: false, message: "Please sign in to continue" }, {
      status: 401,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + 15 * 60;
  const header = encode({ alg: "HS256", typ: "JWT" });
  const payload = encode({
    sub: session.user.id,
    role: (session.user as { role?: string }).role || "customer",
    iat: issuedAt,
    exp: expiresAt,
  });
  const signingInput = `${header}.${payload}`;
  const signature = createHmac("sha256", secret).update(signingInput).digest("base64url");

  return NextResponse.json({
    success: true,
    data: { accessToken: `${signingInput}.${signature}`, expiresAt: expiresAt * 1000 },
  }, { headers: { "Cache-Control": "no-store" } });
}
