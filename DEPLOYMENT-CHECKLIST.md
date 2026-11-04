# TrustPostcode — implementation checklist

## Completed in this prototype
- [x] Responsive dashboard shell and navigation
- [x] Postcode input validation
- [x] Demonstration lookup for documentation example EK-01-A03-FK-01
- [x] Verification result panel and reference ID
- [x] Browser-session history and CSV export
- [x] Secure NIPOST Edge Function proxy source
- [x] Initial Supabase verification table and RLS policies

## Required before live testing
- [ ] Create Supabase project
- [ ] Enable Supabase Auth (email/password)
- [ ] Run `supabase-schema.sql`
- [ ] Add `POSTCODE_API_KEY` in Edge Function secrets
- [ ] Deploy `trustpostcode-api`
- [ ] Add Supabase URL and anon/publishable key to `app.js`
- [ ] Set `demoMode: false`
- [ ] Sign in and test Level 1 lookup with an API-approved postcode

## Required before public production
- [ ] Replace wildcard CORS with the production domain
- [ ] Add rate limiting and abuse protection
- [ ] Persist verification records through authenticated database inserts
- [ ] Add consent, privacy notice, retention and deletion workflows
- [ ] Add organisation roles and tenant isolation
- [ ] Add API usage, cost and entitlement monitoring
- [ ] Security review and end-to-end testing
