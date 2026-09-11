#!/usr/bin/env python3
"""Regenerate the app icons (rust rounded square, paper rest-ring mark). Stdlib only, 4x supersampled."""
import math, struct, zlib

RUST, PAPER = (180, 66, 26), (243, 238, 228)
SS = 4  # supersampling factor

def sample(x, y, size):
    cx = cy = size / 2
    corner = size * 0.22
    dx, dy = max(abs(x - cx) - (size / 2 - corner), 0), max(abs(y - cy) - (size / 2 - corner), 0)
    if math.hypot(dx, dy) > corner: return PAPER          # outside the rounded square (iOS masks anyway)
    d, ang = math.hypot(x - cx, y - cy), math.atan2(y - cy, x - cx)
    if size * 0.26 <= d <= size * 0.34 and not (-math.pi / 2 < ang < 0): return PAPER  # ring with a gap
    if d <= size * 0.09: return PAPER                      # centre dot
    return RUST

def png(size, path):
    big = size * SS
    rows = []
    for y in range(size):
        row = bytearray([0])
        for x in range(size):
            acc = [0, 0, 0]
            for sy in range(SS):
                for sx in range(SS):
                    c = sample(x * SS + sx + 0.5, y * SS + sy + 0.5, big)
                    acc[0] += c[0]; acc[1] += c[1]; acc[2] += c[2]
            row += bytes(v // (SS * SS) for v in acc)
        rows.append(bytes(row))
    raw = b''.join(rows)
    chunk = lambda t, d: struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    open(path, 'wb').write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0))
                           + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))

for size, name in [(192, 'icon-192.png'), (512, 'icon-512.png'), (180, 'apple-touch-icon.png'),
                   (167, 'apple-touch-icon-167.png'), (152, 'apple-touch-icon-152.png'), (120, 'apple-touch-icon-120.png')]:
    png(size, name)
print('icons written')
