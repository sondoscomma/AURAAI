import { useMemo, useState, type JSX } from "react";
import Button from "../components/Button";

type Msg = {
  role: "user" | "assistant";
  content: string;
};


export default function Chat(): JSX.Element {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi — I’m Aura. What are we working on today?" },
  ]);

  const suggestions = useMemo(
    () => ["Summarize this idea", "Write a prompt", "Plan my week", "Generate UI copy"],
    []
  );

  const canSend = input.trim().length > 0;

  const send = (): void => {
    if (!canSend) return;
    const text = input.trim();
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");

    // TODO: replace with backend call later
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Got it. (Next: connect /api/chat.)" },
      ]);
    }, 300);
  };

  return (
    <div className="grid gap-4 md:grid-cols-[280px_1fr]">
      <aside className="rounded-2xl border border-neutral-900 bg-neutral-950 p-4">
        <div className="text-sm font-semibold">Suggestions</div>
        <div className="mt-3 space-y-2">
          {suggestions.map((s) => (
            <button
              key={s}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-900"
              onClick={() => setInput(s)}
              type="button"
            >
              {s}
            </button>
          ))}
        </div>
      </aside>

      <section className="flex min-h-[70vh] flex-col rounded-2xl border border-neutral-900 bg-neutral-950">
        <div className="border-b border-neutral-900 p-4">
          <div className="text-sm text-neutral-400">Chat</div>
          <div className="font-semibold">Aura Assistant</div>
        </div>

        <div className="flex-1 space-y-3 overflow-auto p-4">
          {messages.map((m, idx) => (
            <Bubble key={idx} role={m.role} content={m.content} />
          ))}
        </div>

        <div className="border-t border-neutral-900 p-3">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => (e.key === "Enter" ? send() : null)}
              className="flex-1 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-indigo-600 focus:outline-none"
              placeholder="Message Aura…"
            />
            <Button onClick={send} disabled={!canSend}>
              Send
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Bubble(props: Msg): JSX.Element {
  const isUser = props.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
          isUser ? "bg-indigo-600 text-white" : "bg-neutral-900 text-neutral-100",
        ].join(" ")}
      >
        {props.content}
      </div>
    </div>
  );
}
