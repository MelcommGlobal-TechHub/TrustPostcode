# NaijaLocate — Frontend Foundation

This is the first frontend expansion of the uploaded TrustPostcode prototype. The original navy/blue workspace visual direction and static HTML/CSS/JavaScript stack are retained, while the product interface is expanded into NaijaLocate.

## Included screens

- Overview dashboard
- Find people / public profile discovery
- Postcode lookup preview
- Places and map placeholder
- Personal profile editor with photo preview and optional gender
- Profile field visibility controls
- Sign-in and account creation modal (gender is optional)
- Access request inbox with approve / decline preview interactions
- Notifications centre
- Live location permission and timed sharing preview
- AI location assistant preview
- Privacy and settings
- Integrations workspace

## Run locally

Open `index.html` using a local static server such as VS Code Live Server. No build step or package installation is required.

## Important preview limitations

This is a frontend-only preview. It does not create accounts, transmit access requests, upload profile photos, persist profile changes, send push notifications, store location coordinates, call NIPOST, call a map provider, or connect to an AI model. Demo interactions are labelled and run locally in the browser.

The browser geolocation control requests permission only after the user presses **Use my current location**. Coordinates are displayed locally and are not transmitted. The timed sharing control is a local UI simulation only.

## Backend integration plan

Backend integration will be performed incrementally after the frontend review:

1. Review existing Supabase project and schema without changing live data.
2. Configure Supabase Auth and account creation.
3. Add profile and private profile storage with RLS.
4. Add profile field visibility and public discovery RPC.
5. Add access requests, approvals, grants and revocation.
6. Add in-app notifications and Web Push delivery.
7. Add official NIPOST API integration through a secured Edge Function.
8. Add map provider and explicit, expiring live-location sharing.
9. Add AI assistant through a server-side function with source labels and usage controls.

## Security principles

- Never place service-role keys, NIPOST keys, map secrets or AI provider keys in browser code.
- Keep phone, email, residential address and exact coordinates private by default.
- Enforce visibility and approved access on the server, not only in the UI.
- Require explicit consent for location sharing; apply expiry and revocation.
- Do not present a postcode lookup as proof of identity, ownership or occupancy.
- NaijaLocate is an independent product and must not imply NIPOST affiliation or endorsement.

## Existing SQL file

`supabase-schema.sql` is retained from the original TrustPostcode prototype for reference. It is not the NaijaLocate V2 migration and should not be run as part of this frontend-only step. We will inspect the live Supabase project and apply backend changes one verified step at a time.
