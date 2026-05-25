# 🎿 Alpska šola — spletna stran + CRM

Moderna spletna stran z lastnim CRM sistemom za upravljanje prijavnic.

## 🎯 Kaj projekt vsebuje

- ✅ **Naslovna stran** z modernim alpskim dizajnom
- ✅ **Prijavni obrazec** (`/prijava`) za starše
- ✅ **CRM Dashboard** (`/admin`) za upravljanje prijav
- ✅ **API rute** za shranjevanje v bazo
- ✅ **Avtentikacija** za adminije
- ✅ **Vercel Postgres** baza podatkov
- 🚧 Podstrani programov (sledi v naslednji fazi)

---

## 📦 Tehnologija

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Vercel Postgres**
- **Poppins** font (Google Fonts)

---

## 🚀 Kako lokalno zagnati (na svojem računalniku)

### 1. Namesti Node.js

Pojdi na [nodejs.org](https://nodejs.org) in prenesi **LTS** verzijo (zelena tipka).

### 2. Namesti odvisnosti

V terminalu, v mapi projekta:

```bash
npm install
```

### 3. Naredi `.env.local` datoteko

Kopiraj `.env.local.example` v `.env.local` in vstavi prave vrednosti
(za lokalni razvoj lahko pustiš `POSTGRES_*` prazno - tega ne potrebuješ
dokler ne testiraš obrazcev).

### 4. Zaženi razvoj

```bash
npm run dev
```

Stran se odpre na `http://localhost:3000`.

---

## ☁️ Deploy na Vercel (production)

### Korak 1 — GitHub

1. Pojdi na [github.com](https://github.com) in ustvari nov repository
   (npr. `alpska-sola`).
2. V terminalu, v mapi projekta:

```bash
git init
git add .
git commit -m "Začetna verzija"
git branch -M main
git remote add origin https://github.com/TVOJE_IME/alpska-sola.git
git push -u origin main
```

### Korak 2 — Vercel

1. Pojdi na [vercel.com](https://vercel.com) in se prijavi z GitHub računom.
2. Klikni **"Add New Project"** in izberi svoj GitHub repo.
3. Klikni **"Deploy"** — Vercel naredi vse avtomatsko.
4. Po deploy-u dobiš URL kot `alpska-sola.vercel.app`.

### Korak 3 — Vercel Postgres baza

1. Na Vercel dashboardu pojdi v projekt → **Storage** → **Create Database**.
2. Izberi **Postgres** → izberi regijo (Frankfurt je najbližja).
3. Klikni **Create**.
4. V zavihku **`.env.local`** kopiraj vse `POSTGRES_*` spremenljivke.
5. V Vercel dashboardu pojdi v **Settings → Environment Variables** in
   dodaj:
   - `JWT_SECRET` = nek dolg naključen niz (npr. iz [generate-secret.now.sh](https://generate-secret.vercel.app/32))
   - `SETUP_KEY` = nek skrivni niz (npr. `alpska-2026-secret-XY`)

### Korak 4 — Inicializacija baze (samo enkrat!)

Po deploy-u in dodanih env varih:

1. Spletna stran avtomatsko redeploy-a.
2. V terminalu (ali Postman) pošlji POST request:

```bash
curl -X POST https://tvoja-domena.vercel.app/api/setup \
  -H "Content-Type: application/json" \
  -d '{
    "kljuc": "tvoj-SETUP_KEY",
    "admin_email": "info@alpskasola.com",
    "admin_geslo": "tvoje-mocno-geslo",
    "admin_ime": "Admin"
  }'
```

To naredi:
- ✅ Vse tabele v bazi
- ✅ Prvi admin račun
- ✅ Privzete programe

### Korak 5 — Domena

1. Na Vercel: **Settings → Domains** → dodaj `alpskasola.com`.
2. Vercel ti pokaže DNS zapise, ki jih moraš nastaviti pri **Wix-u**:
   - Tip: `A` ali `CNAME`
   - Vrednost: Vercel-ov strežnik
3. V Wixu pojdi v **Domains** → izberi domeno → **DNS records** in dodaj
   tisto, kar je rekel Vercel.
4. Počakaj 5–60 minut, da DNS propagira.

### Korak 6 — Google Search Console (SEO)

Da Google ne pozabi tvojih starih URL-jev:

1. Pojdi na [search.google.com/search-console](https://search.google.com/search-console).
2. Dodaj svojo domeno (preveri lastništvo prek DNS-a).
3. Pošlji `sitemap.xml`: `https://alpskasola.com/sitemap.xml`
   (ga bom naredil v naslednjem koraku).

---

## 🔧 Kako uporabljam CRM?

1. Pojdi na `https://alpskasola.com/admin/login`.
2. Prijavi se z emailom in geslom, ki si ga nastavil v setup koraku.
3. Vidiš dashboard z vsemi prijavami.

### Stanja prijav:

- **Nova** 🟡 — pravkar oddana, ni še potrjena
- **Potrjeno** 🔵 — kontaktiral sem starše, vse okej
- **Plačano** 🟢 — termin plačan
- **Končano** ⚪ — tečaj končan
- **Preklicano** 🔴 — odpovedano

---

## 📝 Struktura datotek

```
alpska-sola/
├── app/
│   ├── page.tsx                  # Naslovna stran
│   ├── prijava/page.tsx          # Prijavni obrazec
│   ├── admin/
│   │   ├── login/page.tsx        # Admin login
│   │   ├── page.tsx              # CRM dashboard
│   │   └── layout.tsx            # Admin sidebar
│   ├── api/
│   │   ├── prijave/route.ts      # Shrani novo prijavo
│   │   ├── admin/login/route.ts  # Login API
│   │   └── setup/route.ts        # Init baze
│   ├── layout.tsx                # Global layout
│   └── globals.css               # Globalni CSS
├── components/
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── StatsBand.tsx
│   ├── Programs.tsx
│   ├── About.tsx
│   ├── CtaBand.tsx
│   └── Footer.tsx
├── lib/
│   ├── db.ts                     # Baza podatkov
│   └── auth.ts                   # Avtentikacija
├── package.json
├── tailwind.config.ts
└── next.config.js
```

---

## ❓ Pogosta vprašanja

**Q: Kje so vse podstrani (smučanje, plavanje, akademija ...)?**
A: Bodo dodane v naslednjem koraku, ko potrdimo naslovno stran.

**Q: Kako spremenim vsebino?**
A: Vsak tekst je v komponenti v mapi `components/`. Odpri datoteko v
urejevalniku (npr. **VS Code**) in spremeni.

**Q: Kaj če me Vercel zaračuna?**
A: Free plan je dovolj za do 100GB prometa na mesec — to je za veliko strani
preveč. Lahko pa nastaviš opozorila.

**Q: Kaj če nekaj zlomim?**
A: GitHub hrani zgodovino. Vsaka sprememba je commit, lahko se vrneš nazaj.

---

## 📞 Pomoč

- Telefon Alpska šola: **064 230 888**
- Razvoj: tvoj kontakt
