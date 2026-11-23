Luminex Edge Logistics — Manual Netlify Deployment

This repository's GitHub Actions workflow validates the project and packages the complete source folder for a manual Netlify deploy. It does not connect GitHub to Netlify and does not deploy automatically.

After downloading and extracting the workflow artifact:
1. Sign in to Netlify.
2. Open the existing project named lumgelogistics.
3. Open Deploys and use the manual deploy / drag-and-drop area.
4. Upload the complete extracted Luminex-Edge-Logistics-Deploy folder.
5. Keep the browser signed in so Netlify can detect Next.js and run its build.
6. Wait for the deploy to finish, then check the production URL.

Do not upload only the app, components, or public folder. Upload the complete project folder containing package.json and netlify.toml.

The package is generated only after TypeScript validation and the Next.js production build pass in GitHub Actions. Netlify performs its own build when the folder is dropped while you are signed in.

Never put Supabase service-role keys, Paystack secret keys, or other private credentials in the source package or in NEXT_PUBLIC_ environment variables.
