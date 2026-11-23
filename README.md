# Luminex Edge Logistics

Official website and logistics management platform for **Luminex Edge Logistics**, a subsidiary of **Fergroind Holdings**.

**Tagline:** Your Product. Your Budget. Our Responsibility.

## Product scope
- Product catalogue and custom sourcing requests.
- Lagos and Ogun delivery coverage.
- Customer accounts using Firebase Authentication.
- Supabase database, private uploads, order management and server-side operations.
- Customer quotations with separate product and delivery costs.
- Paystack checkout and pay-on-delivery order option.
- Customer order documents and delivery tracking.
- Password-only administrator dashboard with product, order, request and advertising controls.

## Architecture
- Next.js App Router
- Firebase Authentication (customer accounts only)
- Supabase Postgres, Storage and Edge Functions
- Paystack
- Netlify hosting

Firebase is used only for customer identity. The administrator dashboard does not use Firebase. It exchanges the administrator password for a short-lived signed session through the `admin-portal` Edge Function. The session is held in browser session storage and expires after six hours. Never expose the Supabase service-role key, Paystack secret or administrator password in browser code.

## Production site
- Netlify site: **https://lumgelogistics.netlify.app**
- Production metadata and canonical base URL are configured for this exact hostname.
- Firebase project `ericodial` must have `lumgelogistics.netlify.app` listed under Authentication → Settings → Authorized domains.

## Administrator configuration
1. In the Supabase project, create an Edge Function secret named `LUMINEX_ADMIN_PASSWORD`.
2. Use a strong password of at least 16 characters. Keep it private; do not put it in this repository or send it in chat.
3. Open `https://lumgelogistics.netlify.app/admin` and sign in with that password.

The backend checks the password server-side and issues a six-hour administrator JWT. The `admin-reference-file`, `admin-product-upload`, and `admin-product-update` functions validate the same signed session. There is no Firebase administrator login or bootstrap flow.

## Advertising
The admin dashboard supports HTTPS script integrations at:
- `home_top`
- `home_middle`
- `home_bottom`
- `site_footer`

Each integration can be enabled or disabled and accepts only JSON `data-*` script attributes. The public `public-ad-config` function returns enabled integrations; the homepage loads the scripts into their configured placements. The Monetag verification meta value and Google Search Console verification value are configured in `app/layout.tsx`.

## Supabase Edge Functions
- `public-catalogue` — public catalogue data.
- `customer-portal` — customer catalogue, requests, addresses and activity.
- `customer-upload` — private customer reference-file uploads.
- `customer-quotation` — customer quotation acceptance/decline and order creation.
- `customer-order-document` — customer-owned order confirmation data.
- `public-tracking` — delivery lookup using delivery ID and registered phone.
- `admin-portal` — password login and protected admin operations.
- `admin-reference-file` — time-limited links to private customer attachments.
- `admin-product-upload` — protected product image uploads.
- `admin-product-update` — protected catalogue listing status updates.
- `public-ad-config` — enabled public advertising integrations.
- `paystack-initialize` — server-side Paystack checkout initialization.
- `paystack-webhook` — signed Paystack webhook verification.

## Build and manual release
The GitHub Actions workflow validates TypeScript, runs a production build and creates a ZIP source release. It **does not deploy to Netlify**.

1. Open the repository's Actions tab and select the latest successful **Luminex validation and release package** run.
2. Download the `Luminex-Edge-Logistics-Release` artifact ZIP.
3. For production, use the Netlify project's manual deploy/build workflow. This is a Next.js application with server-rendered routes and functions; uploading the raw source ZIP to Netlify Drop is not a valid deployment method. Do not use Netlify Drop as if this were a static HTML site.

## Local development
1. Copy `.env.example` to `.env.local`.
2. Install dependencies with `npm install`.
3. Run `npm run dev`.

The Firebase web API key and Supabase publishable key are public client configuration values. Never add service-role keys, Paystack secret keys, or administrator passwords to `NEXT_PUBLIC_*` variables.

## Release verification
A release is considered ready only after the GitHub workflow passes both `npm run typecheck` and `npm run build`. Separate live end-to-end testing is still required for Firebase signup, request submission, private uploads, quotations, Paystack test payments, webhook confirmation and delivery status updates before accepting real customer orders.
