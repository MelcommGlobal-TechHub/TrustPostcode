# NaijaLocate frontend preview checklist

- [ ] Upload the frontend files to the intended GitHub repository.
- [ ] Confirm `index.html`, `styles.css` and `app.js` are in the deployed root.
- [ ] Deploy as a static site on the selected host.
- [ ] Test navigation on desktop and mobile.
- [ ] Test account modal, optional gender field, profile preview, discovery filters, access request decisions, notifications, postcode sample and assistant preview.
- [ ] Confirm the browser location permission is requested only after the user presses the location button.
- [ ] Confirm no secret keys have been added to frontend files.
- [ ] Do not advertise demo postcode responses as live NIPOST verification.

# Before backend launch

- [ ] Review the existing Supabase project and current schema; do not run legacy SQL blindly.
- [ ] Apply the approved NaijaLocate database migration in small verified steps.
- [ ] Configure Supabase Auth, profile tables, private storage and RLS.
- [ ] Deploy and test each Edge Function before enabling its frontend control.
- [ ] Configure NIPOST secrets server-side only after official API registration.
- [ ] Configure Web Push, map and AI providers with server-side secrets and privacy controls.
- [ ] Complete security testing, consent flows, data retention and privacy notices.
