// app/(dashboard)/layout.tsx
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import Navbar from "../../components/Navbar"; 

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth0.getSession();

  // This check ONLY runs for pages inside the (dashboard) group!
  if (session?.user) {
    const tenantId = session.user['https://helpdesk.com/tenantId'];

    if (!tenantId) {
      redirect('/onboarding');
    }
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}