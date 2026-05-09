# Technický přehled aplikace

Tato aplikace slouží jako správa kulturně-komunitního festivalu "Den pro Brno". Poskytuje veřejnou část pro návštěvníky a administrační část pro organizátory.

## Obsah

1. [Technologický stack](#1-technologický-stack)
2. [Fungování aplikace](#2-fungování-aplikace)
3. [Lokální vývoj](#3-lokální-vývoj)
4. [Sestavení a nasazení](#4-sestavení-build-a-nasazení)
5. [Firebase a databáze](#5-firebase-a-databáze)
6. [Error handling](#6-error-handling)

## 1. Technologický stack

Aplikace je postavena na moderních technologiích pro rychlý a responzivní web:

*   **Frontend**: React (v18+) s Vite jako build nástrojem.
*   **Jazyk**: TypeScript pro zajištění typové bezpečnosti.
*   **Styling**: Tailwind CSS pro tvorbu responzivního designu.
*   **Backend & Databáze**: Firebase (Google Cloud).
    *   **Firestore**: NoSQL dokumentová databáze pro ukládání obsahu a informací o festivalu.
    *   **Firebase Authentication**: OAuth propojení pro zabezpečenou administraci.
    *   **Firebase Storage**: Ukládání obrázků (banner, loga, OG obrázky).
*   **Další knihovny**:
    *   `lucide-react`: Sada ikonek pro UI.
    *   `motion`: Pro responzivní animace prvků.

## 2. Fungování aplikace

### Frontend
Aplikace funguje jako Single Page Application (SPA). Veškerá logika zobrazení je řízena komponentami Reactu, které reagují na data načtená z Firebase.

### Data a real-time aktualizace
Aplikace využívá real-time schopnosti Firebase Firestore. Administrátoři provádějí změny v sekci "Admin", které se po uložení do Firestore okamžitě projeví na veřejné části webu díky `onSnapshot` listenerům, které zajišťují aktualizaci dat na klientovi bez nutnosti obnovení stránky.

### Administrace
Administrační sekce vyžaduje přihlášení (přes Firebase Auth). Umožňuje editaci obsahu jako jsou texty na webu, nahrávání obrázků (banner, loga, OG image) a nastavení SEO metadat.

### SEO a Meta-data
Aplikace dynamicky aktualizuje meta-tagy (`<title>`, `description`, `og:image`, `twitter:*`) při načtení dat z Firebase, což zajišťuje správné zobrazení při sdílení na sociálních sítích. URL webu je kanonizováno na primární doménu pro vyhledávače.

## 3. Lokální vývoj

Pro lokální vývoj bez nutnosti pushovat do gitu:

1. **Vytvoř soubor `.env`** v rootu projektu (viz sekce Firebase níže) — bez něj se aplikace nepřipojí k databázi.

2. **Nainstaluj závislosti** (jen poprvé):
   ```bash
   npm install
   ```

3. **Spusť dev server:**
   ```bash
   npm run dev
   ```

Vite spustí server na `http://localhost:5173` s hot reload — změny v kódu se projeví okamžitě bez obnovení stránky. Aplikace se připojuje přímo k produkční Firebase (stejná databáze jako live web).

> `server.ts` (Express) se při `npm run dev` nepoužívá — slouží pouze pro produkční nasazení na Vercelu.

## 4. Sestavení (Build) a nasazení

Pro zprovoznění projektu lokálně nebo vygenerování produkční verze postupujte následovně:

1. **Instalace závislostí:**
   ```bash
   npm install
   ```

2. **Produkční sestavení (složka `dist`):**
   ```bash
   npm run build
   ```

Tento příkaz spustí `vite build`, který optimalizuje a zkompiluje frontendový kód do statických souborů ve složce `dist/`. Tyto soubory jsou pak servírovány backendem (Express server v `server.ts`) v produkčním prostředí při nastavení `NODE_ENV=production`.

## 5. Firebase a databáze

### Připojení — proměnné prostředí

Projekt vyžaduje soubor `.env` v rootu (není v gitu). Lokálně ho vytvoř ručně, na Vercelu přidej každou proměnnou přes **Settings → Environment Variables**.

```env
# Firebase — připojení k projektu den-pro-brno
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# Sentry — monitoring chyb (volitelné, ale doporučené)
VITE_SENTRY_DSN=
```

Hodnoty pro Firebase najdeš v [Firebase konzoli](https://console.firebase.google.com) → projekt `den-pro-brno` → Project Settings → Your apps. Sentry DSN najdeš v Sentry → Settings → Projects → Client Keys.

> Všechny `VITE_*` proměnné jsou součástí výsledného JS bundle — neukládej sem tajné serverové klíče.

### Lokace bucketu

Firebase Storage bucket musí být vytvořen v regionu **`europe-west3` (Frankfurt)** — jiné regiony (zejména US) způsobují výrazně pomalejší načítání obrázků pro české uživatele.

Lokaci bucketu **nelze změnit** po vytvoření. Při migraci na nový bucket je nutné znovu nahrát všechny obrázky přes Admin panel — URL adresy jsou uloženy jako kompletní stringy v Firestore a změna `VITE_FIREBASE_STORAGE_BUCKET` v `.env` ovlivní pouze nové uploady, stávající URL zůstanou ukazovat na starý bucket.

### Pravidla přístupu

Firebase má **dvě samostatné sady pravidel** — každá v jiném souboru, každá se nasazuje zvlášť:

| Soubor | Co hlídá | Příkaz pro nasazení |
|---|---|---|
| `firestore.rules` | čtení a zápis do databáze | `firebase deploy --only firestore:rules` |
| `storage.rules` | nahrávání a stahování souborů | `firebase deploy --only storage` |

Po každé změně kteréhokoli souboru je nutné pravidla nasadit — jinak zůstanou v cloudu platná stará pravidla.

**Požadavky:**
- nainstalované Firebase CLI: `sudo npm install -g firebase-tools`
- přihlášení: `firebase login`
- nastavený projekt: `firebase use --add` (zvolíš `den-pro-brno`, alias `default`)

**Nasazení obojího najednou:**
```bash
firebase deploy --only firestore:rules,storage
```

## 6. Error handling

Chyby z Firestore jsou zachyceny centrálně funkcí `handleFirestoreError` v `Admin.tsx`. Ta rozlišuje tři typy situací — expirovaný token (přesměruje na přihlášení), nedostatečná oprávnění (zobrazí zprávu) a ostatní neočekávané chyby.

Uživateli se vždy zobrazí pouze stručná zpráva. Technické detaily (stack trace, soubor, řádek, kontext přihlášeného uživatele) se automaticky odesílají do **Sentry**.

### Sentry

Projekt používá Sentry pro monitoring chyb. DSN je uloženo v `.env` jako `VITE_SENTRY_DSN` a na Vercelu jako environment variable stejného názvu.

Každá zachycená chyba obsahuje:
- `collection` — která Firestore kolekce byla dotazována
- `operation` — typ operace (čtení, zápis, smazání…)
- `error_code` — kód chyby z Firebase
- kontext přihlášeného uživatele (uid, email)
- URL stránky kde k chybě došlo

Při každé chybě se navíc nahraje session replay (záznam co uživatel dělal těsně předtím), který je dostupný přímo v Sentry.
