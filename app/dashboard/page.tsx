import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TaskList from "./TaskList";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  return (
    <>
      <h1>Your tasks</h1>
      <p className="muted">Signed in as {data.user.email}</p>
      <TaskList userId={data.user.id} />
    </>
  );
}
