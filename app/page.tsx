import Link from "next/link";

export default function Home() {
  return (
    <>
      <h1>TaskFlow</h1>
      <p className="muted">A simple task list. Upgrade to Pro for unlimited tasks.</p>
      <div className="card">
        <Link href="/login">Log in to your dashboard →</Link>
      </div>
    </>
  );
}
