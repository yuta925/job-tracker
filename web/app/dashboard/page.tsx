import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { Header } from "@/components/ui/Header";

export default async function DashboardPage() {
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
      <main className="flex-1 flex flex-col overflow-hidden">
        <KanbanBoard />
      </main>
    </div>
  );
}
