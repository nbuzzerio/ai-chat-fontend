import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

const OLLAMA_MODEL = "llama3.1:latest";
const OLLAMA_API_URL = "http://localhost:11434/api/chat";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type OllamaChatResponse = {
  message: {
    role: "assistant";
    content: string;
  };
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, error]);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || isLoading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(OLLAMA_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: nextMessages,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Ollama returned ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as OllamaChatResponse;
      if (!data.message?.content) {
        throw new Error("Ollama returned an empty response");
      }

      setMessages((current) => [...current, data.message]);
    } catch (requestError) {
      const detail =
        requestError instanceof Error ? requestError.message : "Unknown error";
      setError(
        `Could not get a response from Ollama. Make sure it is running at localhost:11434 and that browser access is allowed. ${detail}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  return (
    <main className="app-shell">
      <section className="chat" aria-label="Ollama chat">
        <header className="chat-header">
          <h1>Ollama Chat</h1>
          <span>{OLLAMA_MODEL}</span>
        </header>

        <div className="messages" aria-live="polite">
          {messages.length === 0 && (
            <div className="empty-state">
              <h2>How can I help?</h2>
              <p>Your conversation stays in memory on this device.</p>
            </div>
          )}

          {messages.map((message, index) => (
            <article className={`message ${message.role}`} key={index}>
              <div className="message-label">
                {message.role === "user" ? "You" : "Assistant"}
              </div>
              <div className="message-content">{message.content}</div>
            </article>
          ))}

          {isLoading && <div className="status">Thinking...</div>}
          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="composer" onSubmit={handleSubmit}>
          <textarea
            aria-label="Message"
            disabled={isLoading}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Ollama..."
            rows={1}
            value={input}
          />
          <button disabled={isLoading || !input.trim()} type="submit">
            Send
          </button>
        </form>
      </section>
    </main>
  );
}

export default App;
