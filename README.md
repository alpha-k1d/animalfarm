# Animal Farm Ghana Co-operative Platform — Render Hosting Guide

This guide provides step-by-step instructions for hosting the **Animal Farm Ghana** application on [Render](https://render.com).

The application is built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**. It compiles into optimized static client assets, making it ideal for deployment on **Render Static Sites** (which includes a free global CDN, automated SSL/TLS certificates, continuous deployment from Git, and zero server maintenance costs).

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Method 1: 1-Click Blueprint Deploy (Recommended)](#2-method-1-1-click-blueprint-deploy-recommended)
3. [Method 2: Manual Dashboard Setup (Static Site)](#3-method-2-manual-dashboard-setup-static-site)
4. [Critical: SPA Rewrite Rule (Prevent 404s on Refresh)](#4-critical-spa-rewrite-rule-prevent-404s-on-refresh)
5. [Environment Variables](#5-environment-variables)
6. [Configuring Paystack for Render](#6-configuring-paystack-for-render)
7. [Adding a Custom Domain & Free SSL](#7-adding-a-custom-domain--free-ssl)
8. [Alternative: Deploying as a Node.js Web Service](#8-alternative-deploying-as-a-nodejs-web-service)
9. [Local Testing Before Deploy](#9-local-testing-before-deploy)
10. [Troubleshooting Common Issues](#10-troubleshooting-common-issues)

---

## 1. Prerequisites

Before deploying, ensure you have:
1. A **GitHub** or **GitLab** account with this repository pushed.
2. A free **Render** account at [render.com](https://render.com).
3. A **Paystack Ghana** account (if accepting live Mobile Money / Card payments) at [paystack.com](https://paystack.com).

---

## 2. Method 1: 1-Click Blueprint Deploy (Recommended)

This repository includes a `render.yaml` configuration file. Render will automatically detect and configure all build settings, environment variables, headers, and SPA rewrite rules.

1. Push this repository to GitHub.
2. Log in to your [Render Dashboard](https://dashboard.render.com).
3. Click **New +** in the top navigation and select **Blueprint**.
4. Connect your GitHub repository.
5. Render will detect `render.yaml` and show:
   - **Service Name:** `animal-farm-ghana`
   - **Runtime:** `Static Site`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `./dist`
   - **SPA Rewrite Rule:** `/* -> /index.html`
6. Click **Apply**.
7. Render will build and deploy your site automatically. Your live URL will look like:
   ```
   https://animal-farm-ghana.onrender.com
   ```

---

## 3. Method 2: Manual Dashboard Setup (Static Site)

If you prefer configuring the service manually through Render's web interface:

### Step 3.1: Create a Static Site
1. Go to the [Render Dashboard](https://dashboard.render.com).
2. Click the **New +** button in the top right.
3. Select **Static Site**.
4. Connect your GitHub account and choose the repository containing this project.

### Step 3.2: Configure Service Details
Fill in the deployment settings:

| Field | Setting / Value |
|---|---|
| **Name** | `animal-farm-ghana` (or your preferred name) |
| **Branch** | `main` (or your default branch) |
| **Root Directory** | Leave empty (repository root) |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

---

## 4. Critical: SPA Rewrite Rule (Prevent 404s on Refresh)

Because this is a Single Page Application (SPA), client-side routes need to be redirected to `index.html`. Without this rule, refreshing the browser or opening direct links will return a Render 404 error.

1. In your Static Site dashboard on Render, click on **Redirects/Rewrites** in the left sidebar.
2. Click **Add Rule**.
3. Configure the rule:
   - **Type:** `Rewrite`
   - **Source:** `/*`
   - **Destination:** `/index.html`
4. Click **Save Changes**.

*(Note: If you used Method 1 with `render.yaml`, this rule is configured automatically).*

---

## 5. Environment Variables

To add environment variables:
1. Go to your Render service dashboard.
2. Click **Environment** in the left menu.
3. Add the following variables:

| Key | Example Value | Description |
|---|---|---|
| `NODE_VERSION` | `20.18.0` | Ensures Render uses Node 20+ to compile React 19 and Tailwind 4 |
| `VITE_PAYSTACK_PUBLIC_KEY` | `pk_live_...` or `pk_test_...` | Your public Paystack API key for Ghana MoMo & Card checkout |

> **Security Note:** Vite client variables must begin with `VITE_`. Never commit secret keys (`sk_live_...`) to client-side code or public repositories.

---

## 6. Configuring Paystack for Render

To ensure Mobile Money and card payments complete smoothly on your Render domain:

1. Log in to the [Paystack Dashboard](https://dashboard.paystack.com).
2. Navigate to **Settings** > **API Keys & Webhooks**.
3. Under **Domains & Whitelisting**, add your Render domain:
   ```
   https://animal-farm-ghana.onrender.com
   ```
4. If you use a custom domain (e.g., `https://portal.animalfarmghana.com`), whitelist that domain as well.
5. In **Preferences**, ensure **Ghana Cedi (GHS)** and **Mobile Money** channels (MTN MoMo, Telecel Cash, AT Money) are toggled ON.

---

## 7. Adding a Custom Domain & Free SSL

Render provides automatic, managed SSL certificates (Let's Encrypt) with auto-renewal for custom domains.

1. In your Render service, click **Custom Domains** in the left sidebar.
2. Click **Add Custom Domain** and enter your domain (e.g. `app.animalfarmghana.com` or `animalfarmghana.com`).
3. Add the DNS records shown by Render in your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.):
   - **For Subdomain (e.g., `app.domain.com`):**
     - Type: `CNAME`
     - Name/Host: `app`
     - Value: `animal-farm-ghana.onrender.com`
   - **For Apex Domain (e.g., `domain.com`):**
     - Type: `A`
     - Value: Render's designated IP address (shown on screen)
4. Render will verify DNS propagation and issue a free SSL certificate within a few minutes.

---

## 8. Alternative: Deploying as a Node.js Web Service

If you need a backend server process instead of a static site:

1. Choose **Web Service** on Render instead of Static Site.
2. Build Command:
   ```bash
   npm install && npm run build
   ```
3. Start Command:
   ```bash
   npx serve -s dist -l $PORT
   ```
4. Plan: Free or Starter ($7/mo).

*(The Static Site option is recommended because it is faster, CDN-cached, and 100% free).*

---

## 9. Local Testing Before Deploy

You can verify that the production build works identically to Render on your local machine:

```bash
# 1. Install dependencies
npm install

# 2. Run TypeScript checks
npm run lint

# 3. Create the production build
npm run build

# 4. Preview the exact production bundle
npm run preview
```

Open the preview URL (typically `http://localhost:4173`) to verify that all images, navigation tabs, payment popups, and admin authentication function properly.

---

## 10. Troubleshooting Common Issues

### Issue 1: "Page Not Found (404)" on browser refresh
- **Cause:** Client-side routing is trying to request a physical file that doesn't exist on the server.
- **Fix:** Add the rewrite rule under **Redirects/Rewrites**:
  - Source: `/*`
  - Destination: `/index.html`
  - Type: `Rewrite`

### Issue 2: Build fails with "Vite syntax error" or "Node version outdated"
- **Cause:** Render defaulted to an older Node.js version.
- **Fix:** In **Environment Variables**, set `NODE_VERSION` to `20.18.0` and trigger a **Manual Deploy > Clear build cache & deploy**.

### Issue 3: Images not loading
- **Cause:** Hardcoded `/src/assets/images/...` paths in code.
- **Fix:** All assets are stored in the `/public/assets/images/` directory and referenced as `/assets/images/...`. Vite copies these directly to the root of `dist/assets/images/` during build.

### Issue 4: Paystack payment iframe does not launch
- **Cause:** Domain not whitelisted in Paystack dashboard or blocked by browser popup blockers.
- **Fix:** Add your Render URL (`https://*.onrender.com`) to the Paystack whitelist in your Paystack dashboard settings, and ensure `VITE_PAYSTACK_PUBLIC_KEY` is set in Render environment variables.

---

## Administrative Portal Access

Once deployed, the regulatory management desk can be accessed using the Bureau Administration gate:
- **Default Bureau Portal Email:** `admin@animalfarmghana.com`
- **Default Bureau Access Key:** `avhata99`
