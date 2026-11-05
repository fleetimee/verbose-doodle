# Visitor chat mascot stickers

Eleven static, transparent 512×512 WebP stickers for visitor presence chat.
Generated with the built-in image generation tool from the existing
[chibi mascot reference](../biller-operator-mascot-chibi.png), then resized and
encoded with `cwebp -q 90 -resize 512 512`, preserving alpha. Original generated
PNGs remain in the image generation library.

Shared generation prompt: one polished Telegram-style chat sticker using the
reference mascot's identity: brown horse ears with cream tufts, brown side
ponytail with mint streaks, amber-green eyes, receipt-shaped hair clip, cream
utility jacket, charcoal outfit, mint hardware, fingerless gloves, brown tail
with mint tip. Oversized expressive head, compact full body, crisp dark anime
outlines, soft cel shading, simplified details readable at small chat size.
Thick clean white sticker border around character and friendly rounded mint
lettering with dark outline. Tight square framing with safe padding; all ears,
feet, hands, tail and text visible. Genuine transparent background outside the
sticker silhouette. No checkerboard, scene, panel, watermark or other characters.

| File | Text | Pose prompt |
| --- | --- | --- |
| hello.webp | HELLO! | Joyful open-mouth smile, enthusiastic wave, holding code tablet. |
| bye.webp | BYE! | Warm goodbye smile, wave, tablet tucked against body. |
| thanks.webp | THANKS! | Grateful closed-eye smile, appreciative bow, hands together. |
| ok.webp | OK! | Confident smile, clear OK hand gesture. |
| yes.webp | YES! | Enthusiastic grin, fist raised in agreement. |
| nope.webp | NOPE | Playful firm expression, forearms crossed in an X. |
| lol.webp | HAHA! | Laughing with closed eyes, hand at belly. |
| love.webp | LOVE IT! | Adoring happy eyes, holding large mint heart. |
| wow.webp | WOW! | Wide sparkling eyes, amazed mouth, hands beside cheeks. |
| confused.webp | HUH? | Tilted head and ear, puzzled expression, question mark. |
| thinking.webp | HMM... | Thoughtful expression, finger on chin, tablet in other hand. |

The existing text message API stores `[fleetime-sticker:<id>]`. Only exact
catalog matches render as stickers; other messages remain ordinary text.
Delivery receipts, optimistic updates, persisted server history and privacy blur
use the existing visitor chat flow. Clients need the updated frontend to render
sticker tokens as images.
