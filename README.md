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
- Protected admin operations dashboard.

## Architecture

- Next.js App Router
- Firebase Authentication (Email/Password)
- Supabase Postgres, Storage and Edge Functions
- Paystack
- Netlify hosting

Firebase is used for customer identity only. Customer and administrator data operations run through Supabase Edge Functions that verify Firebase ID tokens server-side. Do not expose the Supabase service-role key or Paystack secret in browser code.

## Deploy

The Netlify site project has been created as `lumgelogistics` (`https://lumgelogistics.netlify.app`). The GitHub Actions workflow builds the app on pushes to `main`. To enable automatic production deployment, add a GitHub repository Actions secret:

- `NETLIFY_AUTH_TOKEN` — a personal access token generated in Netlify.

The workflow targets the production Netlify site `lumgelogistics` and deploys the Next.js build. Until this secret is added, CI still runs the TypeScript and production build checks but skips deployment.

## Administrator setup

1. Create an account on the website using Firebase Email/Password.
2. Open `/admin` and sign in with that same Firebase account.
3. In the Supabase project, add an Edge Function secret named `LUMINEX_ADMIN_PASSWORD` with a strong, private setup password.
4. Return to `/admin` and use that password once to activate the first super-administrator account.

The password is checked server-side only. Do not place it in this repository or share it in chat. After the first super administrator is activated, the bootstrap action is closed; additional administrators must be provisioned by an existing administrator through a future access-management control.

## Supabase Edge Functions

- `public-catalogue` — public catalogue data.
- `customer-portal` — customer catalogue, requests, addresses and activity.
- `customer-upload` — private customer reference-file uploads.
- `customer-quotation` — customer quotation acceptance/decline and order creation.
- `customer-order-document` — customer-owned order confirmation data.
- `public-tracking` — delivery lookup using delivery ID and registered phone.
- `admin-portal` — protected admin operations.
- `admin-reference-file` — time-limited links to private customer attachments.
- `admin-product-upload` — protected product image uploads.
- `admin-product-update` — protected catalogue listing status updates.
- `paystack-initialize` — server-side Paystack checkout initialization.
- `paystack-webhook` — signed Paystack webhook verification.

## Local development

1. Copy `.env.example` to `.env.local`.
2. Install dependencies with `npm install`.
3. Run `npm run dev`.

The Firebase web API key and Supabase publishable key are public client configuration values. Never add service-role keys, Paystack secret keys, or administrator passwords to `NEXT_PUBLIC_*` variables.

## Important testing note

The customer, quotation, upload, tracking and admin functions are deployed. A live Netlify deploy and full end-to-end tests (Firebase signup, request submission, file upload, quotation, Paystack test payment, webhook confirmation and delivery updates) are still required before accepting real customer orders.
