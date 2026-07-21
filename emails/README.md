# VoiceBrew transactional email templates

System emails (not agent/campaign templates — those live in Settings → Email).

| Template | Files | Suggested subject |
| --- | --- | --- |
| 2FA / OTP sign-in code | `otp-2fa.html` + `otp-2fa.txt` | `{{OTP_CODE}} is your VoiceBrew sign-in code` |

## Merge tags

`{{USER_NAME}}` · `{{OTP_CODE}}` · `{{EXPIRY_MINUTES}}` · `{{REQUEST_TIME}}` · `{{REQUEST_CITY}}` · `{{APP_URL}}` · `{{SUPPORT_EMAIL}}`

## Rules these templates follow

- Tables + fully inline styles; no webfonts (Georgia / Courier New fallbacks match the app's serif + data-mono look); works with images off (text lockup, no images at all).
- 600px card, mobile media query, hidden preheader, MSO conditionals, `role="presentation"` throughout.
- Light-mode locked (`color-scheme: light`) so the cream/coffee palette isn't inverted by dark-mode clients.
- Always send the `.txt` alongside the `.html` (multipart/alternative).
- OTP emails are security mail: no marketing links, no unsubscribe, and the copy tells users we never ask for the code on any call.
