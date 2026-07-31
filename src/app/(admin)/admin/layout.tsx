import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const session = sessionToken ? await verifyAdminSessionToken(sessionToken) : null;

  if (!session) {
    redirect("/admin-login");
  }

  return <AdminShell session={session}>{children}</AdminShell>;
}