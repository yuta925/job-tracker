import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/ui/Header";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";
import { fetchGoogleCalendarToken } from "@/lib/google_calendar/queries";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const token = await fetchGoogleCalendarToken();

  return (
    <div
      className="flex flex-col"
      style={{ minHeight: "100dvh", background: "var(--md-background)" }}
    >
      <Header userEmail={user.email ?? ""} />
      <main className="flex-1 overflow-auto">
        <ProfilePageClient isGoogleConnected={token !== null} />
      </main>
    </div>
  );
}
