import { NextResponse } from "next/server";

import { buildDemoSeedSnapshot } from "@/data/seed/demo-data";
import { verifyPassword } from "@/data/services/password-hash";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionFromUser,
  createAdminSessionToken,
} from "@/lib/admin-session";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { identifier?: string; password?: string }
    | null;

  const identifier = body?.identifier?.trim().toLowerCase() ?? "";
  const password = body?.password ?? "";

  if (!identifier || !password) {
    return NextResponse.json({ message: "Email or username and password are required" }, { status: 400 });
  }

  const snapshot = await buildDemoSeedSnapshot();
  const user = snapshot.users.find(
    (entry) =>
      entry.isActive !== false &&
      (entry.username.toLowerCase() === identifier || entry.email.toLowerCase() === identifier)
  );

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  const session = createAdminSessionFromUser(user, Date.now() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000);
  const token = await createAdminSessionToken(session);
  const response = NextResponse.json({
    ok: true,
    user: {
      displayName: session.displayName,
      role: session.role,
    },
  });

  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
