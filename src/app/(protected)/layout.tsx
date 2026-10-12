import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import SidebarNav from "../components/layout/SidebarNav";
import SidebarProfile from "../components/layout/SidebarProfile";
import NavBarMobile from "../components/layout/NavBarMobile";
import AiChat from "../components/ai-chat/AiChat";
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row lg:gap-3 xl:p-8 xl:pb-40">
      <div className="w-full  hidden lg:block max-w-[220px] shrink-0">
        <SidebarNav />
      </div>

      <NavBarMobile />

      <main className="flex-1 min-w-0">{children}</main>

      <div className="w-full hidden lg:block max-w-[220px] shrink-0">
        <SidebarProfile />
      </div>

      <AiChat />
    </div>
  );
}
