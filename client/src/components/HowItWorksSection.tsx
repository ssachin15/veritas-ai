export default function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Paste a Link",
      description:
        "Drop in a video URL from Instagram, YouTube, or TikTok. No file upload needed.",
    },
    {
      number: "02",
      title: "Download & Extract",
      description:
        "The backend downloads the video and pulls 8 evenly-spaced frames across its full length.",
    },
    {
      number: "03",
      title: "Model Inference",
      description:
        "Each frame runs through an EfficientNet-B0 model trained on the FaceForensics++ manipulation dataset.",
    },
    {
      number: "04",
      title: "Averaged, Honest Result",
      description:
        "Frame scores are averaged into one confidence score. If the model isn't confident either way, it says so, instead of guessing.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative min-h-screen bg-hero-bg flex items-center px-6 py-24 font-sora border-t border-border"
    >
      <div className="w-full max-w-4xl mx-auto">
        <h2 className="text-foreground text-3xl md:text-4xl font-bold uppercase tracking-tight mb-3">
          How It Works
        </h2>
        <p className="text-muted-foreground font-light mb-16 max-w-xl">
          A straightforward pipeline, built to be transparent about what it
          does and doesn't know.
        </p>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-12">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-5">
              <span className="text-primary text-3xl font-bold shrink-0">
                {step.number}
              </span>
              <div>
                <h3 className="text-foreground text-lg font-semibold uppercase tracking-tight mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground font-light text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 border border-border rounded-sm p-6 bg-secondary/40">
          <p className="text-muted-foreground text-sm font-light leading-relaxed">
            <span className="text-foreground font-medium">A note on accuracy:</span>{" "}
            open-source deepfake detectors trained on older datasets
            consistently underperform against modern, fully AI-generated
            video (Sora, Veo, Kling). This is a documented, industry-wide
            gap as of 2026, not unique to this tool. That's why every result
            here comes with a confidence score and an inconclusive state,
            rather than a hard binary verdict.
          </p>
        </div>
      </div>
    </section>
  );
}
