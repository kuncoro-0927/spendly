import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import SidebarNav from "../components/layout/SidebarNav";
import SidebarProfile from "../components/layout/SidebarProfile";
import NavBarMobile from "../components/layout/NavBarMobile";
import AiChat from "../components/ai-chat/AiChat";
import OnboardingModal from "../components/onboarding/PayDayModal";
import { PeriodProvider } from "@/lib/period/periodProvider";
import GradientDefs from "../components/layout/GradientDefs";
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

  const { data: settings } = await supabase
    .from("user_settings")
    .select("period_start_day")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <PeriodProvider startDay={settings?.period_start_day ?? 1}>
      <div className="min-h-screen flex flex-col lg:flex-row lg:gap-3 xl:p-8 xl:pb-40">
        <div className="w-full  hidden lg:block max-w-[220px] shrink-0">
          <SidebarNav />
        </div>

        <NavBarMobile />
        <GradientDefs />
        <main className="flex-1 min-w-0">{children}</main>

        <div className="w-full hidden lg:block max-w-[220px] shrink-0">
          <SidebarProfile />
        </div>

        <AiChat />
        {!settings && <OnboardingModal userId={user.id} />}
      </div>
    </PeriodProvider>
  );
}
