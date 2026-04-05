import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/ui/Header";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div
      className="flex flex-col"
      style={{ minHeight: "100dvh", background: "var(--md-background)" }}
    >
      <Header userEmail={user.email ?? ""} />
      <main className="flex-1 overflow-auto">
        <ProfilePageClient />
      </main>
    </div>
  );
}
