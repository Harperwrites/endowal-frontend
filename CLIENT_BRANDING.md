# Customize a school or program deployment

The active build-time profile is selected by `NEXT_PUBLIC_CLIENT_ID` (default:
`endowal`). Copy `config/clients/example-school.json`, add the client's logo under
`public/clients/<id>/`, and register the JSON in `lib/client-config.ts`.

Edit the name, tagline, description, local logo/alt text, bank name, navigation
and role labels, primary/accent/paper colors, registration setting, and feature
flags in that profile. Use `NEXT_PUBLIC_API_BASE_URL` for the client's dedicated
API deployment. Restart dev or rebuild after changing environment variables.
The example school profile is a template, not a configured real customer.

The frontend checks `/client` before showing account pages. Its ID, registration
setting, and server-backed feature flags must agree with the API. The API binds
its database and access tokens to the configured client; it does not select a
client from a browser-controlled ID. Use one deployment/database per licensee.
The backend's `CLIENT_DEPLOYMENTS.md` contains setup, production configuration,
initial-administrator provisioning, and license/sublicense metadata guidance.

Configuration handles product branding and feature availability. Curriculum and
marketing copy remain in components for editorial customization. This does not
add central license billing, seat metering, legal agreements, or a shared-database
multi-tenant admin portal. New feature flags do not replace role authorization.

Validation:

```bash
node --test tests/check-writing.test.cjs tests/landing-demo.test.cjs tests/client-config.test.cjs
node node_modules/typescript/bin/tsc --noEmit
```

### Landing-page introduction video

`introVideo` in each client JSON profile selects a local MP4 in `public/` (for example `/videos/endowal-intro.mp4`). Set it to `null` to disable the intro and replay button. The example-school profile leaves it disabled so Endowal's investor film is not shown under a school's branding.

The film opens once per browser tab/session and requires the close button to dismiss it. “Watch our story” reopens it. Playback starts through the explicit Play with sound button, which unmutes the player and sets its volume to 100%. Native controls and a visible sound toggle and volume slider are also available. Closing pauses and unloads the video. To show a new introduction again to returning tabs, increment the `intro-video-dismissed-v1` storage key in `LandingIntroVideo.tsx`.

The original MOV stays outside the project. `public/videos/endowal-intro.mp4` is the browser version with fast start enabled. The film is currently in English; add a verified WebVTT caption track when a final transcript is available.
