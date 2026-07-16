import { useState } from "react";

export default function AnalyzeSection() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("http://localhost:5001/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Try a different link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="analyze"
      className="relative min-h-screen bg-hero-bg flex items-center justify-center px-6 py-24 font-sora"
    >
      <div className="w-full max-w-2xl">
        <h2 className="text-foreground text-3xl md                                                                                                                :text-4xl font-bold uppercase tracking-tight mb-3">
          Analyze a Video
        </h2>
        <p className="text-muted-foreground font-light mb-10">
          Paste a link from Instagram, YouTube, or TikTok. This can take 15-30
          seconds — we download the video, sample frames, and run each through
          the detection model.
        </p>

        <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.instagram.com/reel/..."
            className="flex-1 bg-secondary text-foreground placeholder:text-muted-foreground px-4 py-3 rounded-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground px-8 py-3 text-sm font-bold rounded-sm hover:brightness-110 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </form>

        {loading && (
          <div className="opacity-0 animate-fade-in mt-8 border border-border rounded-sm p-6 bg-secondary/40">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-muted-foreground text-sm">
                Downloading video and running frame analysis...
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="opacity-0 animate-fade-in mt-8 border border-destructive/40 rounded-sm p-6 bg-destructive/10">
            <p className="text-destructive text-sm font-medium">{error}</p>
          </div>
        )}

        {result && (
          <div className="opacity-0 animate-fade-in mt-8 border border-border rounded-sm p-6 md:p-8 bg-secondary/40">
            <div className="flex items-center justify-between mb-6">
              <span className="text-muted-foreground text-xs uppercase tracking-widest">
                Prediction
              </span>
              <span
                className={`text-2xl font-bold uppercase ${result.prediction === "FAKE"
                  ? "text-destructive"
                  : result.prediction === "INCONCLUSIVE"
                    ? "text-muted-foreground"
                    : "text-primary"
                  }`}
              >
                {result.prediction}
              </span>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-xs text-muted-foreground mb-2 uppercase tracking-widest">
                <span>Confidence</span>
                <span>{result.confidence}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${result.prediction === "FAKE"
                    ? "bg-destructive"
                    : result.prediction === "INCONCLUSIVE"
                      ? "bg-muted-foreground"
                      : "bg-primary"
                    }`}
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
            </div>

            <div className="flex gap-6 text-xs text-muted-foreground mb-6">
              <span>Real score: {result.avg_real}</span>
              <span>Fake score: {result.avg_fake}</span>
              <span>{result.frame_count} frames analyzed</span>
            </div>

            <p className="text-muted-foreground/70 text-xs font-light leading-relaxed border-t border-border pt-4">
              This model is trained on older-style face-swap manipulation
              datasets (FaceForensics++). Fully AI-generated video from newer
              tools (Sora, Veo, Kling) is a known industry-wide challenge in
              2026 — treat this result as one signal, not a verdict.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}