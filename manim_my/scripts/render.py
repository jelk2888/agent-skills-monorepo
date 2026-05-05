"""
Manim 渲染辅助脚本
提供场景渲染、质量选择、格式输出等功能
"""
import subprocess
import sys
import os
import argparse


QUALITY_MAP = {
    "low": "-ql",
    "medium": "-qm",
    "high": "-qh",
    "4k": "-qk",
}

FORMAT_MAP = {
    "mp4": "",
    "gif": "-i",
    "png": "-s",
    "webm": "--format webm",
}


def detect_manim_version():
    try:
        result = subprocess.run(
            ["manim", "--version"],
            capture_output=True, text=True, timeout=10
        )
        if result.returncode == 0:
            return "community"
    except FileNotFoundError:
        pass

    try:
        result = subprocess.run(
            [sys.executable, "-m", "manim", "--version"],
            capture_output=True, text=True, timeout=10
        )
        if result.returncode == 0:
            return "3b1b"
    except FileNotFoundError:
        pass

    return None


def render_scene(
    file_path,
    scene_name,
    quality="low",
    output_format="mp4",
    preview=True,
    transparent=False,
):
    version = detect_manim_version()
    if version is None:
        print("Error: manim is not installed. Install with: pip install manim")
        sys.exit(1)

    cmd = ["manim"] if version == "community" else [sys.executable, "-m", "manim"]

    if preview:
        cmd.append("-p")

    quality_flag = QUALITY_MAP.get(quality, "-ql")
    cmd.append(quality_flag)

    format_flag = FORMAT_MAP.get(output_format, "")
    if format_flag:
        cmd.extend(format_flag.split())

    if transparent:
        cmd.append("-t")

    cmd.extend([file_path, scene_name])

    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd)
    sys.exit(result.returncode)


def list_scenes(file_path):
    version = detect_manim_version()
    if version is None:
        print("Error: manim is not installed.")
        sys.exit(1)

    cmd = ["manim"] if version == "community" else [sys.executable, "-m", "manim"]
    cmd.extend([file_path, "--list"])

    result = subprocess.run(cmd, capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print(result.stderr)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Manim render helper")
    parser.add_argument("file", help="Scene file path")
    parser.add_argument("scene", nargs="?", help="Scene class name")
    parser.add_argument("-q", "--quality", default="low",
                        choices=["low", "medium", "high", "4k"])
    parser.add_argument("-f", "--format", default="mp4",
                        choices=["mp4", "gif", "png", "webm"])
    parser.add_argument("-p", "--preview", action="store_true", default=True)
    parser.add_argument("--no-preview", dest="preview", action="store_false")
    parser.add_argument("-t", "--transparent", action="store_true")
    parser.add_argument("--list", action="store_true", help="List scenes")

    args = parser.parse_args()

    if args.list:
        list_scenes(args.file)
    elif args.scene:
        render_scene(
            args.file, args.scene,
            quality=args.quality,
            output_format=args.format,
            preview=args.preview,
            transparent=args.transparent,
        )
    else:
        print("Error: provide scene name or use --list")
        parser.print_help()
