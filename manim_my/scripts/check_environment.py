#!/usr/bin/env python3
"""
Manim Animation Skill - Environment Check
Verifies all required dependencies are installed and configured.
"""

import subprocess
import sys
import shutil
import importlib


def check_mark(ok):
    return "✅" if ok else "❌"


def warn_mark(ok):
    return "✅" if ok else "⚠️"


def run_cmd(cmd_args, capture=True):
    try:
        result = subprocess.run(
            cmd_args, capture_output=capture, text=True, timeout=30
        )
        return result.returncode == 0, result.stdout.strip()
    except Exception as e:
        return False, str(e)


def run_pipe(cmd1_args, cmd2_args):
    try:
        p1 = subprocess.Popen(cmd1_args, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        p2 = subprocess.Popen(cmd2_args, stdin=p1.stdout, stdout=subprocess.PIPE, text=True)
        p1.stdout.close()
        output, _ = p2.communicate(timeout=30)
        return p2.returncode == 0, output.strip()
    except Exception as e:
        return False, str(e)


def check_python_version():
    v = sys.version_info
    ok = v.major >= 3 and v.minor >= 9
    print(f"  {check_mark(ok)} Python {v.major}.{v.minor}.{v.micro}" +
          ("" if ok else " (requires >= 3.9)"))
    return ok


def check_command(name, version_cmd_str, install_hint):
    ok = shutil.which(name) is not None
    if ok:
        cmd_args = version_cmd_str.split()
        success, version = run_cmd(cmd_args)
        version_str = version.split('\n')[0][:80] if success else "installed"
        print(f"  {check_mark(ok)} {name}: {version_str}")
    else:
        print(f"  {check_mark(ok)} {name}: NOT FOUND")
        print(f"       Install: {install_hint}")
    return ok


def check_python_package(package, import_name=None, install_hint=None):
    import_name = import_name or package
    try:
        mod = importlib.import_module(import_name)
        version = getattr(mod, '__version__', 'installed')
        print(f"  {check_mark(True)} {package}: {version}")
        return True
    except ImportError:
        hint = install_hint or f"pip install {package}"
        print(f"  {check_mark(False)} {package}: NOT FOUND")
        print(f"       Install: {hint}")
        return False


def check_optional_package(package, import_name=None, install_hint=None):
    import_name = import_name or package
    try:
        mod = importlib.import_module(import_name)
        version = getattr(mod, '__version__', 'installed')
        print(f"  {warn_mark(True)} {package}: {version}")
        return True
    except ImportError:
        hint = install_hint or f"pip install {package}"
        print(f"  {warn_mark(False)} {package}: not installed (optional)")
        print(f"       Install: {hint}")
        return False


def check_ffmpeg_libx264():
    ok, output = run_pipe(
        ["ffmpeg", "-codecs"],
        ["grep", "libx264"]
    )
    if ok and "libx264" in output:
        print(f"  {check_mark(True)} ffmpeg libx264 encoder: available")
        return True
    else:
        print(f"  {check_mark(False)} ffmpeg libx264 encoder: NOT available")
        print("       Manim hardcodes libx264 — rendering will FAIL without it!")
        print("       macOS: brew tap homebrew-ffmpeg/ffmpeg && brew install homebrew-ffmpeg/ffmpeg/ffmpeg-full")
        print("       Conda: conda install x264 -c conda-forge")
        return False


def check_ffmpeg_libass():
    ok, output = run_pipe(
        ["ffmpeg", "-filters"],
        ["grep", "-i", "subtitles"]
    )
    if ok and "subtitles" in output:
        print(f"  {check_mark(True)} ffmpeg subtitles filter (libass): available")
        return True
    else:
        print(f"  {warn_mark(False)} ffmpeg subtitles filter (libass): NOT available")
        print("       SRT subtitle burn-in will not work.")
        print("       macOS: brew tap homebrew-ffmpeg/ffmpeg && brew install homebrew-ffmpeg/ffmpeg/ffmpeg-full")
        print("       Linux: apt install libass-dev && rebuild ffmpeg")
        return False


def check_chinese_fonts():
    fonts_to_check = ["PingFang SC", "Noto Sans CJK", "Microsoft YaHei", "SimHei", "WenQuanYi"]
    ok, output = run_pipe(
        ["fc-list", ":lang=zh", "family"],
        ["head", "-10"]
    )
    if ok and output:
        font_list = output.split('\n')[:5]
        print(f"  {check_mark(True)} Chinese fonts found:")
        for f in font_list:
            print(f"         - {f.strip()}")
        return True
    else:
        ok2, output2 = run_pipe(
            ["system_profiler", "SPFontsDataType"],
            ["grep", "-i", "pingfang"]
        )
        if ok2 and output2:
            print(f"  {check_mark(True)} Chinese fonts: PingFang SC (macOS built-in)")
            return True
        print(f"  {warn_mark(False)} Chinese fonts: not detected")
        print("       Manim Text() with Chinese characters may not render properly.")
        print("       Linux: sudo apt install fonts-noto-cjk")
        return False


def main():
    print("=" * 60)
    print("  Manim Animation Skill — Environment Check")
    print("=" * 60)
    print()

    all_ok = True
    warnings = []

    print("🔧 System Tools")
    print("-" * 40)
    all_ok &= check_python_version()
    all_ok &= check_command("manim", "manim --version", "pip install manim")
    all_ok &= check_command("ffmpeg", "ffmpeg -version", "brew install ffmpeg (macOS)")
    check_command("ffprobe", "ffprobe -version", "installed with ffmpeg")
    print()

    print("📦 Core Python Packages")
    print("-" * 40)
    all_ok &= check_python_package("manim", "manim", "pip install manim")
    all_ok &= check_python_package("numpy", "numpy", "pip install numpy")
    print()

    print("🎙️ Voiceover Packages")
    print("-" * 40)
    all_ok &= check_python_package(
        "manim-voiceover", "manim_voiceover",
        'pip install "manim-voiceover[gTTS]"'
    )
    all_ok &= check_python_package(
        "gTTS", "gtts",
        'pip install "manim-voiceover[gTTS]"'
    )
    print()

    print("🔌 Optional Packages")
    print("-" * 40)
    check_optional_package("pyttsx3", "pyttsx3", 'pip install "manim-voiceover[pyttsx3]"')
    print()

    print("🎬 FFmpeg Features")
    print("-" * 40)
    has_libx264 = check_ffmpeg_libx264()
    if not has_libx264:
        all_ok = False
    has_libass = check_ffmpeg_libass()
    if not has_libass:
        warnings.append("ffmpeg lacks libass — SRT subtitle burn-in disabled")
    if not has_libx264 or not has_libass:
        print()
        print("  💡 Tip: Install ffmpeg-full to get both libx264 + libass:")
        print("      brew tap homebrew-ffmpeg/ffmpeg")
        print("      brew install homebrew-ffmpeg/ffmpeg/ffmpeg-full")
        print("      brew link --force ffmpeg-full")
    print()

    print("🔤 Chinese Fonts")
    print("-" * 40)
    has_fonts = check_chinese_fonts()
    if not has_fonts:
        warnings.append("Chinese fonts not detected — Text rendering may fail")
    print()

    print("=" * 60)
    if all_ok:
        print("✅ All required dependencies are installed!")
    else:
        print("❌ Some required dependencies are missing.")
        print("   Please install them before using the skill.")

    if warnings:
        print()
        print("⚠️  Warnings:")
        for w in warnings:
            print(f"   - {w}")

    print()
    print("Quick install all required dependencies:")
    print('  pip install manim "manim-voiceover[gTTS]"')
    print("  # macOS: install ffmpeg-full (includes libx264 + libass)")
    print("  brew tap homebrew-ffmpeg/ffmpeg")
    print("  brew install homebrew-ffmpeg/ffmpeg/ffmpeg-full")
    print("=" * 60)

    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main())
