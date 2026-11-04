# TrustPostcode

A mobile-first prototype for Nigerian National Digital Alphanumeric Postcode lookup and address verification.

## Current capabilities
- Dashboard, verification workflow, activity history and CSV export
- Postcode format validation (AA-99-A99-AA-99)
- Clearly labelled demo mode using the official documentation's illustrative sample response
- Secure Supabase Edge Function proxy for live NIPOST API calls
- RLS-protected verification-history schema

## Project files
- `index.html` — application shell and pages
- `styles.css` — responsive interface
- `app.js` — navigation, demo workflow and frontend integration
- `supabase-schema.sql` — initial database schema and RLS
- `supabase/functions/trustpostcode-api/index.ts` — authenticated server-side NIPOST proxy
- `.env.example` — configuration checklist

## Run locally
Open `index.html` in a local static server (for example VS Code Live Server). Demo mode works without credentials.

## Enable live NIPOST lookups
1. Create a Supabase project.
2. Run `supabase-schema.sql` in the Supabase SQL Editor.
3. In Supabase Edge Function secrets, set `POSTCODE_API_KEY` to the secret from your NIPOST developer dashboard.
4. Deploy the function:
   ```bash
   supabase functions deploy trustpostcode-api
   ```
5. Configure the frontend in `app.js`:
   - `supabaseUrl`: your project URL
   - `supabaseAnonKey`: your Supabase anon/publishable key
   - `demoMode`: `false`
6. Enable Supabase Auth and sign in before invoking the live function. The function validates the user's JWT with Supabase Auth.

## Security notes
- Never put `POSTCODE_API_KEY` in frontend JavaScript, HTML, GitHub, or a public environment variable.
- The Edge Function uses the caller's JWT and the anon key to validate identity. It does not use or accept a service-role key.
- Configure restrictive CORS origins before production.
- Add server-side rate limiting, abuse monitoring, consent and data-retention rules before public launch.
- The prototype currently stores history in browser session storage. The SQL table is supplied for the next persistence integration; the current frontend does not yet write to it.
- Do not represent a successful postcode lookup as proof of a person's identity, property ownership or occupancy.
