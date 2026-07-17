import json
import torch
from torchvision import transforms
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights
from PIL import Image
import subprocess
import argparse
import os
import sys
import glob
import shutil

def load_model(model_path="models/best_model.pt"):
    weights = EfficientNet_B0_Weights.IMAGENET1K_V1
    model = efficientnet_b0(weights=weights)
    in_features = model.classifier[1].in_features
    model.classifier = torch.nn.Sequential(
        torch.nn.Dropout(0.4),
        torch.nn.Linear(in_features, 2)
    )
    model.load_state_dict(torch.load(model_path, map_location="cpu"))
    model.eval()
    return model

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

def predict_image(image_path, model):
    image = Image.open(image_path).convert("RGB")
    input_tensor = transform(image).unsqueeze(0)
    with torch.no_grad():
        output = model(input_tensor)
        probs = torch.softmax(output, dim=1)[0]
    return probs[0].item(), probs[1].item()

def download_video(url, out_dir="downloads"):
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "input_video.mp4")

    if os.path.exists(out_path):
        os.remove(out_path)

    print("[*] Downloading video...")
    subprocess.run([
        sys.executable, "-m", "yt_dlp",
        "-f", "mp4",
        "-o", out_path,
        url
    ], check=True)

    return out_path

def extract_frames(video_path, frames_dir="frames", num_frames=8):
    if os.path.exists(frames_dir):
        shutil.rmtree(frames_dir, ignore_errors=True)
    os.makedirs(frames_dir, exist_ok=True)

    result = subprocess.run([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", video_path
    ], capture_output=True, text=True)
    duration = float(result.stdout.strip())

    print(f"[*] Video duration: {duration:.1f}s -- extracting {num_frames} frames...")

    interval = duration / (num_frames + 1)
    for i in range(1, num_frames + 1):
        timestamp = interval * i
        out_frame = os.path.join(frames_dir, f"frame_{i:02d}.jpg")
        subprocess.run([
            "ffmpeg", "-ss", str(timestamp), "-i", video_path,
            "-frames:v", "1", "-q:v", "2", out_frame, "-y",
            "-loglevel", "quiet"
        ], check=True)

    return sorted(glob.glob(os.path.join(frames_dir, "*.jpg")))

def classify_video(url, num_frames=8):
    model = load_model()

    video_path = download_video(url)
    frame_paths = extract_frames(video_path, num_frames=num_frames)

    real_scores = []
    fake_scores = []

    print("[*] Running model on each frame...")
    for i, frame_path in enumerate(frame_paths, 1):
        real_p, fake_p = predict_image(frame_path, model)
        real_scores.append(real_p)
        fake_scores.append(fake_p)
        print(f"  Frame {i}: Real={real_p:.3f} | Fake={fake_p:.3f}")

    avg_real = sum(real_scores) / len(real_scores)
    avg_fake = sum(fake_scores) / len(fake_scores)

    top_score = max(avg_real, avg_fake)

    if top_score < 0.65:
        final_label = "INCONCLUSIVE"
    else:
        final_label = "FAKE" if avg_fake > avg_real else "REAL"

    confidence = top_score * 100

    print("\n" + "=" * 40)
    print(f"FINAL PREDICTION: {final_label}")
    print(f"Confidence: {confidence:.1f}%")
    print(f"(avg real={avg_real:.3f}, avg fake={avg_fake:.3f} across {len(frame_paths)} frames)")
    print("=" * 40)

    result = {
        "prediction": final_label,
        "confidence": round(confidence, 1),
        "avg_real": round(avg_real, 3),
        "avg_fake": round(avg_fake, 3),
        "frame_count": len(frame_paths)
    }
    print("RESULT_JSON:" + json.dumps(result))

def classify_video_for_api(url, num_frames=8):
    """Same as classify_video, but returns the result dict instead of just printing it."""
    model = load_model()
    video_path = download_video(url)
    frame_paths = extract_frames(video_path, num_frames=num_frames)

    real_scores = []
    fake_scores = []

    for frame_path in frame_paths:
        real_p, fake_p = predict_image(frame_path, model)
        real_scores.append(real_p)
        fake_scores.append(fake_p)

    avg_real = sum(real_scores) / len(real_scores)
    avg_fake = sum(fake_scores) / len(fake_scores)
    top_score = max(avg_real, avg_fake)

    if top_score < 0.65:
        final_label = "INCONCLUSIVE"
    else:
        final_label = "FAKE" if avg_fake > avg_real else "REAL"

    confidence = top_score * 100

    return {
        "prediction": final_label,
        "confidence": round(confidence, 1),
        "avg_real": round(avg_real, 3),
        "avg_fake": round(avg_fake, 3),
        "frame_count": len(frame_paths)
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("url", help="Social media video link (YouTube, Instagram, etc.)")
    parser.add_argument("--frames", type=int, default=8, help="Number of frames to sample")
    args = parser.parse_args()

    classify_video(args.url, num_frames=args.frames)
