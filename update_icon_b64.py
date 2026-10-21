import base64
import re
import os

with open(r'C:\Users\Robert.Delport\.gemini\antigravity\scratch\Clubstride Mobile-app\icon-192.png', 'rb') as f:
    b64_192 = base64.b64encode(f.read()).decode('utf-8')

index_path = r'C:\Users\Robert.Delport\.gemini\antigravity\scratch\Clubstride Mobile-app\index.html'
with open(index_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Replace EMBEDDED_ICON_B64 declaration
new_decl = 'const EMBEDDED_ICON_B64 = "data:image/png;base64,' + b64_192 + '";'
html = re.sub(r'const EMBEDDED_ICON_B64 = [^;]+;', new_decl, html)

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(html)

print("Updated index.html with new EMBEDDED_ICON_B64. Length of b64:", len(b64_192))


