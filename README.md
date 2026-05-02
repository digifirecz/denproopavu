# Den pro Brno - Technický přehled

Tato aplikace slouží jako správa kulturně-komunitního festivalu "Den pro Brno". Poskytuje veřejnou část pro návštěvníky a administrační část pro organizátory.

## Technologický stack

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

## Fungování aplikace

### Frontend
Aplikace funguje jako Single Page Application (SPA). Veškerá logika zobrazení je řízena komponentami Reactu, které reagují na data načtená z Firebase.

### Data a real-time aktualizace
Aplikace využívá real-time schopnosti Firebase Firestore. Administrátoři provádějí změny v sekci "Admin", které se po uložení do Firestore okamžitě projeví na veřejné části webu díky `onSnapshot` listenerům, které zajišťují aktualizaci dat na klientovi bez nutnosti obnovení stránky.

### Administrace
Administrační sekce vyžaduje přihlášení (přes Firebase Auth). Umožňuje editaci obsahu jako jsou texty na webu, nahrávání obrázků (banner, loga, OG image) a nastavení SEO metadat.

### SEO a Meta-data
Aplikace dynamicky aktualizuje meta-tagy (`<title>`, `description`, `og:image`, `twitter:*`) při načtení dat z Firebase, což zajišťuje správné zobrazení při sdílení na sociálních sítích. URL webu je kanonizováno na primární doménu pro vyhledávače.

## Sestavení (Build) a Nasazení

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
