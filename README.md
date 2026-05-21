# 🎸 Morgan Wallen Fan Hub

A fan website for Morgan Wallen where fans can send wishes and read positive testimonies.

## Features

- ✅ **Fan Wish Form** – Fans fill in personal + contact info and send a heartfelt wish
- ✅ **Auto Email Forwarding** – All submissions forwarded to `ronaldwadetrawick@gmail.com` via EmailJS
- ✅ **Positive Testimonies** – Generated country music fan testimonies displayed in a beautiful grid
- ✅ **Responsive Design** – Works perfectly on all devices
- ✅ **Dark Country Theme** – Amber/gold color scheme with star effects

## EmailJS Setup (Required for Email Delivery)

To enable actual email delivery, set up a free EmailJS account:

1. Go to [https://emailjs.com](https://emailjs.com) and create a free account
2. Add an **Email Service** (connect your Gmail) → copy the **Service ID**
3. Create an **Email Template** with these variables:
   - `{{to_email}}` — recipient
   - `{{from_name}}` — fan's full name
   - `{{from_email}}` — fan's email
   - `{{phone}}`, `{{city}}`, `{{state}}`, `{{country}}`
   - `{{subject}}`, `{{message}}`, `{{newsletter}}`
   - `{{dob}}`, `{{gender}}`
4. Copy your **Public Key** from Account settings
5. In `src/index.tsx`, replace:
   - `YOUR_PUBLIC_KEY` → your EmailJS public key
   - `YOUR_SERVICE_ID` → your EmailJS service ID
   - `YOUR_TEMPLATE_ID` → your EmailJS template ID

## Tech Stack

- **Hono** – Lightweight edge-ready backend
- **Cloudflare Pages** – Deployment platform
- **EmailJS** – Browser-side email delivery (no backend required)
- **TailwindCSS** – Utility-first styling (CDN)
- **Font Awesome** – Icons (CDN)

## Development

\`\`\`bash
npm install
npm run build
pm2 start ecosystem.config.cjs
\`\`\`

## Deployment

\`\`\`bash
npm run deploy:prod
\`\`\`

## Contact / Email Destination

All fan wishes are forwarded to: `ronaldwadetrawick@gmail.com`
