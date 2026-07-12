"""Render the deterministic Spinnit learning social card."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "src" / "assets" / "images" / "spinnit-learn-ai-social.png"
FONT_REGULAR = Path("C:/Windows/Fonts/arial.ttf")
FONT_BOLD = Path("C:/Windows/Fonts/arialbd.ttf")

WIDTH = 1200
HEIGHT = 630
BACKGROUND = "#0a0a0f"
TEXT = "#ffffff"
MUTED = "#8e899f"
LAVENDER = "#c4b5fd"
PURPLE = "#8b5cf6"
PANEL = "#171622"
PANEL_LIGHT = "#211d36"
BORDER = "#514a70"
BRAND_TEXT = "Spinnit"
HEADLINE_TEXT = "Learn AI by doing."
COURSE_TEXT = "Free practical AI prompting course"


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size=size)


def rounded_panel(draw: ImageDraw.ImageDraw, box, radius=18, fill=PANEL, outline=BORDER, width=2):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def arrow(draw: ImageDraw.ImageDraw, x1: int, x2: int, y: int):
    draw.line((x1, y, x2, y), fill=PURPLE, width=5)
    draw.line((x2 - 14, y - 14, x2, y), fill=PURPLE, width=5)
    draw.line((x2 - 14, y + 14, x2, y), fill=PURPLE, width=5)


def main() -> None:
    image = Image.new("RGB", (WIDTH, HEIGHT), BACKGROUND)
    draw = ImageDraw.Draw(image)

    draw.ellipse((900, -85, 1215, 230), fill="#120d22")
    draw.ellipse((555, 455, 835, 735), fill="#100d1c")

    draw.text((72, 58), BRAND_TEXT[:-2], font=font(FONT_BOLD, 30), fill="#f4f2ff")
    spinn_width = draw.textlength(BRAND_TEXT[:-2], font=font(FONT_BOLD, 30))
    draw.text((72 + spinn_width, 58), BRAND_TEXT[-2:], font=font(FONT_BOLD, 30), fill="#a78bfa")
    draw.text((72, 148), HEADLINE_TEXT, font=font(FONT_BOLD, 72), fill=TEXT)
    draw.text((72, 244), COURSE_TEXT, font=font(FONT_BOLD, 30), fill=LAVENDER)

    rounded_panel(draw, (72, 380, 212, 446), radius=16, fill=PANEL_LIGHT)
    draw.rounded_rectangle((94, 400, 166, 409), radius=5, fill="#a78bfa")
    draw.rounded_rectangle((94, 418, 188, 425), radius=4, fill="#504b69")
    arrow(draw, 234, 288, 413)

    rounded_panel(draw, (312, 368, 522, 458), radius=18, fill=PANEL_LIGHT)
    draw.ellipse((334, 392, 354, 412), fill="#a78bfa")
    draw.rounded_rectangle((366, 393, 482, 404), radius=6, fill="#9f7aea")
    draw.rounded_rectangle((336, 422, 480, 430), radius=4, fill="#514d6c")
    draw.rounded_rectangle((336, 438, 442, 446), radius=4, fill="#514d6c")
    arrow(draw, 546, 600, 413)

    rounded_panel(draw, (626, 352, 956, 474), radius=24, fill=PANEL_LIGHT, outline="#625a83")
    draw.rounded_rectangle((654, 380, 736, 452), radius=14, fill="#8b5cf6")
    draw.rounded_rectangle((762, 384, 894, 396), radius=6, fill="#a78bfa")
    draw.rounded_rectangle((762, 411, 920, 420), radius=5, fill="#514d6c")
    draw.rounded_rectangle((762, 432, 880, 441), radius=5, fill="#514d6c")
    draw.ellipse((900, 416, 976, 492), fill="#7c3aed", outline=LAVENDER, width=3)
    draw.line((921, 454, 937, 470), fill="#f4f2ff", width=8)
    draw.line((937, 470, 959, 441), fill="#f4f2ff", width=8)

    draw.line((72, 566, 1128, 566), fill="#29253c", width=2)
    draw.text((72, 581), "spinnit.site/learn/ai-prompting/", font=font(FONT_REGULAR, 18), fill=MUTED)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    image.save(OUTPUT, format="PNG", optimize=True, compress_level=9)
    print(f"Rendered {OUTPUT} ({WIDTH}x{HEIGHT}, {OUTPUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
