"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Create the client only in the browser (event handlers / effects), never during server rendering.
// createBrowserClient returns a cached singleton, so calling it repeatedly is cheap.
const supabase = () => createClient();

type Task = { id: number; title: string; done: boolean };

export default function TaskList({ userId }: { userId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [plan, setPlan] = useState("free");
  const [title, setTitle] = useState("");

  useEffect(() => {
    // RLS already limits rows to this user; the filters keep queries explicit and indexed.
    supabase()
      .from("tasks")
      .select("id, title, done")
      .eq("user_id", userId)
      .order("created_at")
      .then(({ data }) => setTasks(data ?? []));
    supabase()
      .from("profiles")
      .select("plan")
      .eq("id", userId)
      .single()
      .then(({ data }) => setPlan(data?.plan ?? "free"));
  }, [userId]);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const { data } = await supabase().from("tasks").insert({ title, user_id: userId }).select().single();
    if (data) setTasks((t) => [...t, data]);
    setTitle("");
  }

  async function toggle(task: Task) {
    await supabase().from("tasks").update({ done: !task.done }).eq("id", task.id);
    setTasks((t) => t.map((x) => (x.id === task.id ? { ...x, done: !x.done } : x)));
  }

  return (
    <div className="card">
      <p>
        Plan: <span className="badge">{plan}</span>
      </p>
      <form className="row" onSubmit={addTask}>
        <input placeholder="New task" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button type="submit">Add</button>
      </form>
      <ul className="tasks">
        {tasks.map((t) => (
          <li key={t.id} className={t.done ? "done" : ""}>
            <input type="checkbox" checked={t.done} onChange={() => toggle(t)} style={{ width: "auto", margin: 0 }} />
            <span>{t.title}</span>
          </li>
        ))}
      </ul>
      {plan === "free" && (
        <form action="/api/stripe/checkout" method="POST" style={{ marginTop: 16 }}>
          <button className="secondary" type="submit">Upgrade to Pro</button>
        </form>
      )}
    </div>
  );
}
