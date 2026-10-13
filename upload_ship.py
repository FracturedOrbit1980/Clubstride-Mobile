import urllib.request
import urllib.error
import uuid
import json
import re

zip_path = r"C:\Users\Robert.Delport\Desktop\GameOn-Upload-New.zip"
boundary = uuid.uuid4().hex

with open(zip_path, "rb") as f:
    file_bytes = f.read()

header = f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"GameOn-Upload-New.zip\"\r\nContent-Type: application/zip\r\n\r\n".encode("utf-8")
footer = f"\r\n--{boundary}--\r\n".encode("utf-8")
data = header + file_bytes + footer

req = urllib.request.Request(
    "https://ship.place/upload",
    data=data,
    headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
)

try:
    with urllib.request.urlopen(req, timeout=90) as resp:
        raw_bytes = resp.read()
        with open("upload_result.bin", "wb") as out:
            out.write(raw_bytes)
        text = raw_bytes.decode("utf-8", errors="ignore")
        # Find any URLs in the text
        urls = re.findall(r'https?://[^\s"\'<>]+', text)
        print("FOUND URLS:", urls)
except Exception as e:
    print("ERROR:", e)
