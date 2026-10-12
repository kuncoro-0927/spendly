import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import SidebarNav from "../components/layout/SidebarNav";
import SidebarProfile from "../components/layout/SidebarProfile";
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
    <div className="min-h-screen flex gap-3 xl:p-8 xl:pb-40">
      <div className="w-full max-w-[220px] shrink-0">
        <SidebarNav />
      </div>

      <main className="flex-1 min-w-0">{children}</main>

      <div className="w-full max-w-[220px] shrink-0">
        <SidebarProfile />
      </div>

      <AiChat />
    </div>
  );
}
