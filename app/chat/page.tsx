"use client";

// Door 2. This page loads no wallet code and no third-party code. It takes tickets off the device, puts them in the
// Authorization header (RFC 9577 PrivateToken) and sends the conversation through the verified, sealing client: the
// gate sees tickets and ciphertext, the enclave sees the question, nobody sees both the wallet and the question.
// History stays in this browser.

import { useEffect, useState } from "react";
import { enclave } from "@/lib/enclave";
import { countTickets, putTickets, takeTickets } from "@/lib/tickets";

type Msg = { role: "user" | "assistant"; content: string };
type Model = { id: string; tickets: number; maxTokens: number; reasoning?: string };

/** The model's price, and one more ticket for each 2,000 tokens of conversation past the first, at most 8. */
function ticketsFor(model: Model, messages: Msg[]): number {
  const tokens = Math.ceil(messages.reduce((n, m) => n + m.content.length + 8, 0) / 4);
  return Math.min(8, Math.max(model.tickets, Math.ceil(tokens / 2_000) * model.tickets));
}

export default function ChatPage() {
  const [model, setModel] = useState<Model | null>(null);
  const [tickets, setTickets] = useState<number | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    countTickets().then(setTickets);
    fetch("/api/models")
      .then((r) => r.json())
      .then((d: { open: boolean; models: Model[] }) => setModel(d.open ? d.models[0] : null));
    enclave().then(
      () => setVerified(true),
      () => setVerified(false),
    );
  }, []);

  async function send() {
    if (!model || !draft.trim() || busy) return;
    const convo: Msg[] = [...messages, { role: "user", content: draft.trim() }];
    const n = ticketsFor(model, convo);
    const taken = await takeTickets(n);
    if (taken.length < n) {
      await putTickets(taken);
      setNote(n === 1 ? "No tickets on this device. Draw some at Tickets." : `This message needs ${n} tickets.`);
      return;
    }

    setBusy(true);
    setDraft("");
    setNote("");
    setMessages([...convo, { role: "assistant", content: "" }]);
    try {
      const client = await enclave();
      const res = await client.fetch("chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "text/event-stream",
          authorization: taken.map((t) => `PrivateToken token="${t.token}"`).join(", "),
        },
        body: JSON.stringify({
          model: model.id,
          messages: convo,
          stream: true,
          max_tokens: model.maxTokens * Math.max(1, Math.floor(n / model.tickets)),
          ...(model.reasoning ? { reasoning_effort: model.reasoning } : {}),
        }),
      });

      if (!res.ok) {
        const message = ((await res.json().catch(() => ({}))) as { error?: { message?: string } }).error?.message ?? "";
        if (/No ticket was spent|were returned/i.test(message)) await putTickets(taken);
        setNote(message || `The gate refused the request (${res.status}).`);
        setMessages(convo);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let text = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let cut: number;
        while ((cut = buffer.indexOf("\n\n")) >= 0) {
          const event = buffer.slice(0, cut);
          buffer = buffer.slice(cut + 2);
          for (const line of event.split("\n")) {
            const data = line.startsWith("data:") ? line.slice(5).trim() : "";
            if (!data || data === "[DONE]") continue;
            try {
              const piece = JSON.parse(data).choices?.[0]?.delta?.content;
              if (piece) {
                text += piece;
                setMessages([...convo, { role: "assistant", content: text }]);
              }
            } catch {
              // a keep-alive or a partial line
            }
          }
        }
      }
    } catch {
      // The request never reached the gate: the tickets are unspent.
      await putTickets(taken);
      setNote("Could not reach the gate. Your tickets were kept.");
      setMessages(convo);
    } finally {
      setBusy(false);
      setTickets(await countTickets());
    }
  }

  return (
    <>
      <header className="bar">
        <span className="mark">Blindwoods</span>
        <span className={verified ? "verified" : "unverified"}>
          {verified === null ? "checking enclave…" : verified ? "verified" : "not verified"}
        </span>
        <span>tickets: {tickets ?? "…"}</span>
      </header>

      <section className="log" aria-live="polite">
        {messages.map((m, i) => (
          <p key={i}>
            <strong>{m.role === "user" ? "You" : "Blindwoods"}:</strong> {m.content}
          </p>
        ))}
        {note && <p role="status">{note}</p>}
      </section>

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask anything. Nobody can see who asked."
          aria-label="Your question"
        />
        <button type="submit" disabled={!model || !verified || busy}>
          Ask
        </button>
      </form>
    </>
  );
}
