from PIL import Image
import base64

try:
    im = Image.open('icon.jpg')
    print('Original:', im.format, im.size)
    
    # Save standard PNGs for Apple & Android PWAs
    im.save('icon.png', 'PNG')
    
    # Save standard sizes: 180x180 (Apple touch icon), 192x192 (Android standard), 512x512
    im_180 = im.resize((180, 180), Image.Resampling.LANCZOS)
    im_180.save('icon-180.png', 'PNG')
    
    im_192 = im.resize((192, 192), Image.Resampling.LANCZOS)
    im_192.save('icon-192.png', 'PNG')
    
    im_512 = im.resize((512, 512), Image.Resampling.LANCZOS)
    im_512.save('icon-512.png', 'PNG')
    
    with open('icon-192.png', 'rb') as f:
        b64_192 = base64.b64encode(f.read()).decode('utf-8')
    with open('icon_b64_png.txt', 'w', encoding='utf-8') as f:
        f.write(b64_192)
        
    print('Successfully generated icon.png, icon-180.png, icon-192.png, icon-512.png')
except Exception as e:
    print('PIL error:', e)
