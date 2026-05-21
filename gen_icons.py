from PIL import Image, ImageDraw, ImageFilter
import os

def make_bg(size, c1=(8, 14, 45), c2=(20, 60, 145)):
    img = Image.new('RGBA', (size, size))
    draw = ImageDraw.Draw(img)
    for y in range(size):
        t = y / max(size - 1, 1)
        # diagonal feel: top-left darker, bottom-right lighter
        tx = (y / size + 0.3)
        tx = min(1.0, tx)
        r = int(c1[0] + (c2[0] - c1[0]) * tx)
        g = int(c1[1] + (c2[1] - c1[1]) * tx)
        b = int(c1[2] + (c2[2] - c1[2]) * tx)
        draw.line([(0, y), (size - 1, y)], fill=(r, g, b, 255))
    return img

def resize_keep_ratio(img, max_px):
    w, h = img.size
    if w >= h:
        new_w = max_px
        new_h = int(h * max_px / w)
    else:
        new_h = max_px
        new_w = int(w * max_px / h)
    return img.resize((new_w, new_h), Image.LANCZOS)

def add_glow(bg, src, size, heart_pct=0.70):
    max_px = int(size * (heart_pct + 0.12))

    # Glow
    glow = resize_keep_ratio(src, max_px)
    glow_blur = glow.filter(ImageFilter.GaussianBlur(radius=int(size * 0.055)))
    r, g, b, a = glow_blur.split()
    glow_tinted = Image.merge('RGBA', (
        r.point(lambda x: min(255, int(x * 0.35))),
        g.point(lambda x: min(255, int(x * 0.60))),
        b.point(lambda x: min(255, int(x * 1.4))),
        a.point(lambda x: int(x * 0.7))
    ))
    gx = (size - glow.width)  // 2
    gy = (size - glow.height) // 2
    bg.paste(glow_tinted, (gx, gy), glow_tinted)

    # Sharp heart — preserva proporção
    heart = resize_keep_ratio(src, int(size * heart_pct))
    hx = (size - heart.width)  // 2
    hy = (size - heart.height) // 2
    bg.paste(heart, (hx, hy), heart)
    return bg

src = Image.open("coracao.png").convert("RGBA")
os.makedirs("icons", exist_ok=True)

for size in [72, 96, 128, 144, 152, 192, 384, 512]:
    bg = make_bg(size)
    icon = add_glow(bg, src, size, heart_pct=0.70)
    icon.save("icons/icon-" + str(size) + ".png", "PNG")
    print("  icon-" + str(size) + ".png criado")

for size in [192, 512]:
    bg = make_bg(size)
    icon = add_glow(bg, src, size, heart_pct=0.56)
    icon.save("icons/icon-maskable-" + str(size) + ".png", "PNG")
    print("  icon-maskable-" + str(size) + ".png criado")

print("Pronto!")
