# PNG regression check

Chrome canvas -> PNG Blob -> decoded bitmap round-trip verified 64 cases: 8 blessings, 4 hugs, 30 predictions, 20 tickets and both coin faces. All were 1080×1920, every text block fit, zero failures; the minimum dark text pixel count after decoding PNG was 5198. PNG files downloaded through the browser and visually inspected included butterfly, hug, ticket and coin.

The invisible-text regression came from reusing the glow gradient as fillStyle. The shared renderer uses isolated save/restore for decoration and resets the ink, alpha and shadow for each text draw. Before returning a PNG it checks the rendered text region.

Mobile save dialog verified in 390×700, 390×840 and 320×600 frames: actual card preview, visible direct download, separate file sharing and long-press fallback. Physical iOS/Android and messenger browsers were not available.
