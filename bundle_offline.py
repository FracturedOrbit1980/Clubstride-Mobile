import base64
import os
import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

with open('tailwind.min.css', 'r', encoding='utf-8') as f:
    tw_css = f.read()

with open('clubstride-tokens.css', 'r', encoding='utf-8') as f:
    tokens_css = f.read()

with open('html2pdf.bundle.min.js', 'r', encoding='utf-8') as f:
    pdf_js = f.read()

# Replace Tailwind stylesheet link with inlined style
target_css_link = '<link rel="stylesheet" href="./tailwind.min.css" />'
inline_css = "<style>\n" + tw_css + "\n</style>"

if target_css_link in html:
    html = html.replace(target_css_link, inline_css)

# Inline the Clubstride CI design tokens
target_tokens_link = '<link rel="stylesheet" href="./clubstride-tokens.css" />'
inline_tokens = "<style>\n" + tokens_css + "\n</style>"

if target_tokens_link in html:
    html = html.replace(target_tokens_link, inline_tokens)

# Inline the Clubstride CI component scripts (icon loader, sub badges, hydration)
for component in ('Icon.js', 'SubBadge.js', 'cs-init.js'):
    with open(os.path.join('src', 'components', component), 'r', encoding='utf-8') as f:
        body = f.read()
    html = html.replace(
        '<script src="./src/components/%s"></script>' % component,
        "<script>\n" + body + "\n</script>",
    )

# Replace html2pdf script tag with inlined script
target_pdf = """  <!-- html2pdf (Offline local with CDN fallback) -->
  <script src="./html2pdf.bundle.min.js"></script>
  <script>
    if (typeof html2pdf === 'undefined') {
      document.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"><\\/script>');
    }
  </script>"""

inline_pdf = "<script>\n" + pdf_js + "\n</script>"

if target_pdf in html:
    html = html.replace(target_pdf, inline_pdf)
else:
    html = html.replace('<script src="./html2pdf.bundle.min.js"></script>', inline_pdf)

# Embed every ./assets/** image as a data URI so the bundle stays single-file offline
MIME = {'.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg'}


def embed(match):
    path = match.group(1)
    local = path[2:] if path.startswith('./') else path
    if not os.path.exists(local):
        print('Warning: asset not found, left as-is:', local)
        return match.group(0)
    ext = os.path.splitext(local)[1].lower()
    if ext not in MIME:
        return match.group(0)
    with open(local, 'rb') as f:
        data = base64.b64encode(f.read()).decode('ascii')
    return '"' + 'data:%s;base64,%s' % (MIME[ext], data) + '"'


html = re.sub(r'"(\./assets/[^"]+?\.(?:svg|png|jpe?g))"', embed, html)

with open('Clubstride Lite.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Created 100% self-contained Clubstride Lite.html. Total size:", len(html))
