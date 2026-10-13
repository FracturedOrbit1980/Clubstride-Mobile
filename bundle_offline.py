import os

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

with open('tailwind.js', 'r', encoding='utf-8') as f:
    tw_js = f.read()

with open('html2pdf.bundle.min.js', 'r', encoding='utf-8') as f:
    pdf_js = f.read()

# Replace Tailwind tag
target_tw = """  <!-- Tailwind CSS (Offline local with CDN fallback) -->
  <script src="./tailwind.js"></script>
  <script>
    if (typeof tailwind === 'undefined') {
      document.write('<script src="https://cdn.tailwindcss.com"><\\/script>');
    }
  </script>"""

inline_tw = "<script>\n" + tw_js + "\n</script>"

# Replace html2pdf tag
target_pdf = """  <!-- html2pdf (Offline local with CDN fallback) -->
  <script src="./html2pdf.bundle.min.js"></script>
  <script>
    if (typeof html2pdf === 'undefined') {
      document.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"><\\/script>');
    }
  </script>"""

inline_pdf = "<script>\n" + pdf_js + "\n</script>"

if target_tw in html:
    html = html.replace(target_tw, inline_tw)
else:
    # Alternative direct script tag replace
    html = html.replace('<script src="./tailwind.js"></script>', inline_tw)

if target_pdf in html:
    html = html.replace(target_pdf, inline_pdf)
else:
    html = html.replace('<script src="./html2pdf.bundle.min.js"></script>', inline_pdf)

with open('gameon.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Created 100% self-contained gameon.html. Total size:", len(html))
