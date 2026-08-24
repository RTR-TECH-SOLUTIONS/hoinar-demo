#!/bin/zsh
# Descarca imagini Higgsfield direct in src/assets/media/produse.
# Argumente: perechi "url destinatie"
set -e
DST="src/assets/media/produse"
mkdir -p "$DST"
while [ $# -gt 0 ]; do
  url="$1"; nume="$2"; shift 2
  curl -sL "$url" -o "/tmp/hf-tmp.png"
  python3 -c "
from PIL import Image
im = Image.open('/tmp/hf-tmp.png').convert('RGB')
im.save('$DST/$nume', quality=92, subsampling=1)
print('$nume', im.size)
"
done
