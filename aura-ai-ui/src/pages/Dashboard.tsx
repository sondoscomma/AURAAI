import { Link } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import type { JSX } from "react";


export default function Dashboard(): JSX.Element {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-neutral-400">Your workspace overview.</p>
        </div>
        <Link to="/app/chat">
          <Button>Open Chat</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat title="Conversations" value="12" />
        <Stat title="Documents" value="7" />
        <Stat title="Tasks" value="21" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Recent activity">
          <ul className="space-y-2 text-sm text-neutral-300">
            <li>• Drafted product description</li>
            <li>• Summarized meeting notes</li>
            <li>• Created 3 tasks</li>
          </ul>
        </Card>

        <Card title="Quick actions">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary">New project</Button>
            <Button variant="secondary">Upload file</Button>
            <Button variant="secondary">Invite member</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat(props: { title: string; value: string }): JSX.Element {
  return (
    <div className="rounded-2xl border border-neutral-900 bg-neutral-950 p-5">
      <div className="text-sm text-neutral-400">{props.title}</div>
      <div className="mt-2 text-3xl font-semibold">{props.value}</div>
    </div>
  );
}
