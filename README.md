# VERITAS AI - Deepfake Video Detector

A full-stack tool that analyzes video links from Instagram, YouTube, and TikTok to detect AI-generated or manipulated content, built with an honest approach to a genuinely hard problem.

## What it does

Paste a social media video link, and the system:
1. Downloads the video server-side (no manual upload needed)
2. Extracts 8 evenly-spaced frames across the video's length
3. Runs each frame through an EfficientNet-B0 model
4. Averages the scores into a single confidence result: REAL, FAKE, or INCONCLUSIVE

## Why "Inconclusive" exists

Most deepfake detectors force a binary REAL/FAKE answer even when the underlying signal is weak, which means a 51 percent confidence score gets presented with the same authority as a 99 percent one. This project treats a low-confidence result as information, not something to hide. If the model's top score is below 65 percent, it reports "Inconclusive" rather than guessing.

## A note on accuracy

This model is trained on FaceForensics++, a well-established but aging dataset built on older face-swap manipulation techniques. It performs reasonably well on that category of manipulation.

However, modern AI video generators such as Sora, Veo, Kling, and Runway Gen-4 do not work by swapping faces onto real footage. They synthesize entire frames from scratch, leaving none of the blending artifacts this model was trained to detect. This is a documented, industry-wide gap as of 2026. Published benchmarks show even leading open-source detectors trained on older datasets score 61 to 69 percent accuracy on real-world content.

I built this project fully aware of that limitation, and designed the confidence-score plus inconclusive-state UI specifically so the tool does not overstate what it actually knows.

## Tech stack

Frontend: React with Vite, TypeScript, Tailwind CSS, Spline for the 3D background.
Backend: Node.js, Express, MongoDB with Mongoose.
ML Pipeline: Python, Flask, PyTorch, torchvision with EfficientNet-B0, yt-dlp, ffmpeg.

## Architecture

User pastes link in React frontend, which sends a request to the Express backend. Express calls the Python Flask microservice over HTTP. The Flask service uses yt-dlp to download the video and ffmpeg to extract 8 frames. Each frame is run through the EfficientNet-B0 model. Scores are averaged into a confidence value and a label of REAL, FAKE, or INCONCLUSIVE. The result is saved to MongoDB and returned to the frontend.

## Running locally

Prerequisites: Node.js, Python 3.x, and ffmpeg installed and on PATH.

Python environment, from project root:
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python python_service.py

Backend, in a separate terminal:
cd server
npm install
node app.js

Create a .env file in server folder with MONGO_URI, PORT=5001, and PYTHON_SERVICE_URL=http://localhost:5002

Frontend, in a separate terminal:
cd client
npm install
npm run dev

## Known limitations

Model trained on older face-swap datasets, weaker against fully AI-synthesized video. Private or restricted social media content may fail to download. Platform re-encoding strips all metadata. Processing takes 15 to 30 seconds per video.

## Credits

Built on a pretrained EfficientNet-B0 deepfake classifier originally developed by T Rahul Singh, Mallikarjun Macherla, and Sainath. The link-to-result pipeline, honesty-first UI, and full-stack integration were built on top of that foundation.
