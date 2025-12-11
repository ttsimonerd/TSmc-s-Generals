import React, { useState } from "react";
import { generate } from "./api/gen";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const data = await generate(prompt);
      // adapt to the actual response shape from your model
      // e.g., data.candidates[0].content or data.outputText
      const text = data?.candidates?.[0]?.content || data?.outputText || JSON.stringify(data);
      setResult(text);
    } catch (err: any) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>TSmc's Generals (local)</h1>
      <form onSubmit={onSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter prompt..."
          rows={6}
          style={{ width: "100%", marginBottom: 12 }}
        />
        <div>
          <button type="submit" disabled={loading || !prompt.trim()}>
            {loading ? "Generating…" : "Generate"}
          </button>
        </div>
      </form>

      {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
      {result && (
        <div style={{ marginTop: 12 }}>
          <h3>Result</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>{result}</pre>
        </div>
      )}
    </div>
  );
}
