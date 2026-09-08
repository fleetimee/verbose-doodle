"""Export Blender's rendered RGBA frames as browser-ready video and WebP assets.

Encodes transparent WebM (VP9 + alpha) for modern browsers and transparent
HEVC MP4 (VideoToolbox + alpha) for Safari/iOS, plus lossless still and
fallback animated WebP assets.
Requires Pillow and FFmpeg. Run after rendering frames 1–96 from the mascot blend file.
"""

from pathlib import Path
import shutil
import subprocess

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
FRAMES = ROOT / "output/mascot"
DEST = ROOT / "public/brand"

# 1. Save lossless still poster
frames = [
    Image.open(FRAMES / f"frame-{i:04d}.png").convert("RGBA")
    for i in range(1, 97)
]
still_dest = DEST / "biller-operator-mascot-still.webp"
frames[0].save(still_dest, lossless=True)
print(f"{still_dest.name}: {still_dest.stat().st_size:,} bytes")

ffmpeg_bin = shutil.which("ffmpeg")
if not ffmpeg_bin:
    raise SystemExit("ffmpeg is required to encode WebM and MP4 mascot videos.")

# Check for hevc_videotoolbox support (macOS Safari transparent video)
encoders_check = subprocess.run(
    [ffmpeg_bin, "-encoders"],
    capture_output=True,
    text=True,
    check=False,
)
has_videotoolbox = "hevc_videotoolbox" in encoders_check.stdout

states = [("greeting", 4000), ("thinking", 4000)]

for state, milliseconds in states:
    input_pattern = str(FRAMES / "frame-%04d.png")

    # 2. Transparent WebM (VP9 + alpha) for Chrome, Firefox, Edge
    webm_dest = DEST / f"biller-operator-mascot-{state}.webm"
    subprocess.run(
        [
            ffmpeg_bin,
            "-y",
            "-framerate",
            "24",
            "-i",
            input_pattern,
            "-c:v",
            "libvpx-vp9",
            "-pix_fmt",
            "yuva420p",
            "-crf",
            "16",
            "-b:v",
            "0",
            str(webm_dest),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
        check=True,
    )
    print(f"{webm_dest.name}: {webm_dest.stat().st_size:,} bytes")

    # 3. Transparent HEVC MP4 for Safari & iOS
    if has_videotoolbox:
        mp4_dest = DEST / f"biller-operator-mascot-{state}.mp4"
        subprocess.run(
            [
                ffmpeg_bin,
                "-y",
                "-framerate",
                "24",
                "-i",
                input_pattern,
                "-c:v",
                "hevc_videotoolbox",
                "-pix_fmt",
                "bgra",
                "-alpha_quality",
                "1",
                "-tag:v",
                "hvc1",
                str(mp4_dest),
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
            check=True,
        )
        print(f"{mp4_dest.name}: {mp4_dest.stat().st_size:,} bytes")

    # 4. Fallback animated WebP
    durations = [
        round((i + 1) * milliseconds / len(frames))
        - round(i * milliseconds / len(frames))
        for i in range(len(frames))
    ]
    webp_dest = DEST / f"biller-operator-mascot-{state}.webp"
    frames[0].save(
        webp_dest,
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=0,
        quality=85,
        method=3,
    )
    print(f"{webp_dest.name}: {webp_dest.stat().st_size:,} bytes")
