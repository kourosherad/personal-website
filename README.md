# Kourosh Moradi — Portfolio

Personal portfolio & CV for **Kourosh Moradi**, Fullstack Web Developer.
Bilingual (English / Persian, RTL-aware), light/dark theme, animated three.js hero.

Built with **Vite + Tailwind CSS + anime.js + three.js**. Deploys as a static site with a serverless contact endpoint.

## Tech stack

| Area      | Tech                                  |
| --------- | ------------------------------------- |
| Build     | Vite 5                                |
| Styling   | Tailwind CSS 3 (compiled, PostCSS)    |
| Animation | anime.js, three.js (hero particles)   |
| Contact   | Serverless function + Resend (email)  |
| Hosting   | Any static host (Vercel-ready)        |

## Project structure

```
.
├── index.html            # Markup (no inline scripts/styles)
├── src/
│   ├── main.js           # App logic: i18n, theme, tabs, animations, three.js, contact
│   ├── i18n.js           # EN/FA dictionaries
│   └── style.css         # Tailwind directives + custom CSS
├── api/
│   └── contact.js        # Serverless contact endpoint (Resend)
├── public/
│   └── favicon.svg
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── vercel.json
```

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
```

> The contact form posts to `/api/contact`. That endpoint only runs on a host
> that executes serverless functions (e.g. `vercel dev` or a deployed Vercel/
> Netlify site). With `vite dev` alone the request will fail and the form shows
> the error message — that's expected locally.

To run the API locally too, install the Vercel CLI and use `vercel dev`:

```bash
npm i -g vercel
vercel dev
```

## Build

```bash
npm run build    # outputs static site to dist/
npm run preview  # preview the production build locally
```

## Deploy (Vercel — recommended)

1. Push this repo to GitHub.
2. Import it at https://vercel.com/new — it auto-detects Vite.
3. Add the contact-form environment variables (see below).
4. Deploy. The `api/contact.js` function is detected automatically.

### Other static hosts

`npm run build` produces a plain `dist/` you can drop on **Netlify**, **GitHub
Pages**, **Cloudflare Pages**, etc. Those without Vercel-style `/api` functions
need the contact endpoint reimplemented as their own function (e.g. a Netlify
function under `netlify/functions/`).

## Environment variables

Set these in your host's dashboard (or a local `.env`, see `.env.example`):

| Variable             | Description                                      |
| -------------------- | ------------------------------------------------ |
| `RESEND_API_KEY`     | Resend API key — https://resend.com/api-keys     |
| `CONTACT_TO_EMAIL`   | Address that receives contact messages           |
| `CONTACT_FROM_EMAIL` | Verified Resend sender address                   |

## Customizing

- **Text / translations:** `src/i18n.js`
- **Colors / fonts:** `tailwind.config.js`
- **Links (GitHub, LinkedIn, etc.):** `index.html` contact section
- **Canonical URL & social meta:** `<head>` in `index.html`

## License

MIT
