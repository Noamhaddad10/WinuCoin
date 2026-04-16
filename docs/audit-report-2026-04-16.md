# Rapport d'audit — WinuWallet

**Date** : 2026-04-16
**Perimetre** : Audit complet (tout)

---

## Synthese executive

**Verdict global** : **ACCEPTABLE**
**Score** : 62/100

**Top 3 des problemes** :
1. Race conditions critiques sur la numerotation des tickets et le compteur `tickets_sold` dans le webhook Stripe
2. Zero tests — aucun fichier de test dans le projet
3. Politique RLS sur `competitions` bloque la lecture des competitions terminées pour les utilisateurs normaux (le filtre "ended" ne fonctionne pas cote client)

**Top 3 des points positifs** :
1. Securite solide : RLS active sur toutes les tables, verification de signature Stripe, pas de secrets en dur, admin client server-only
2. Code TypeScript propre : zero `any`, zero `@ts-ignore`, zero erreur de type (`tsc --noEmit` passe)
3. i18n complet et synchronise : EN/FR avec 100% des cles alignees

---

## 1. Structure et conventions

### Architecture App Router — BIEN
- Root layout minimal (`src/app/layout.tsx`) avec structure HTML dans `[locale]/layout.tsx`
- Separation propre : `src/lib/` (utilitaires), `src/components/` (UI), `src/app/[locale]/` (pages), `src/app/api/` (routes)
- `'use client'` utilise correctement : 17 composants client, tous dans `src/components/`
- Aucun hook React dans un Server Component (verifie)

### Middleware / Proxy
- **ATTENTION** : Le middleware est dans `src/proxy.ts` et non `src/middleware.ts`. C'est peut-etre une convention Next.js 16, mais si le framework ne reconnait pas ce fichier, les routes protegees (/dashboard, /admin) ne seraient protegees que par les layouts serveur (qui eux font bien la verification). **A verifier en production.**
- Le proxy protege `/dashboard` et `/admin` avec une verification Supabase auth + role pour admin

### Imports
- Aliases `@/` utilises partout, pas d'imports relatifs profonds
- Pas d'imports circulaires detectes

### Taille des fichiers
| Fichier | Lignes |
|---------|--------|
| `PhoneMockup.tsx` | 685 |
| `[slug]/page.tsx` | 405 |
| `page.tsx` (landing) | 384 |
| `Header.tsx` | 294 |
| `DrawWinnerClient.tsx` | 268 |

`PhoneMockup.tsx` (685 lignes) est le fichier le plus gros — probablement acceptable pour un composant d'animation complexe.

---

## 2. Bugs potentiels

### CRITIQUE — Race condition sur la numerotation des tickets
**Fichier** : `src/app/api/webhooks/stripe/route.ts:162-179`

```
const { data: maxRow } = await admin
  .from('tickets')
  .select('ticket_number')
  .eq('competition_id', competitionId)
  .order('ticket_number', { ascending: false })
  .limit(1)
  .maybeSingle()

const startNumber = (maxRow?.ticket_number ?? 0) + 1
```

Deux webhooks concurrents pour la meme competition peuvent lire le meme `maxRow` et generer les memes numeros de ticket. Il n'y a aucun verrou DB, aucune contrainte UNIQUE sur `(competition_id, ticket_number)`, et aucune sequence PostgreSQL.

**Recommandation** : Ajouter une contrainte `UNIQUE(competition_id, ticket_number)` et utiliser un compteur atomique (e.g., `FOR UPDATE` lock ou `nextval()` sur une sequence).

### CRITIQUE — Race condition sur `tickets_sold`
**Fichier** : `src/app/api/webhooks/stripe/route.ts:191-206`

Le code lit `competition.tickets_sold`, ajoute `count`, et ecrit le resultat. Deux webhooks concurrents s'ecrasent mutuellement.

**Recommandation** : Utiliser un `UPDATE ... SET tickets_sold = tickets_sold + $count` atomique plutot qu'un read-then-write.

### CRITIQUE — RLS bloque les competitions terminees
**Fichier** : `supabase/migrations/002_is_published.sql:14-16`

La politique `"competitions: read active"` n'autorise que `status = 'active' AND is_published = TRUE`. Or `src/app/[locale]/competitions/page.tsx:38-43` tente de lire les competitions `.neq('status', 'active')` via le client normal (non-admin). Ces requetes retourneront toujours vide a cause de la RLS.

**Consequence** : L'onglet "Ended" de la page competitions est non fonctionnel pour les utilisateurs normaux.

**Recommandation** : Modifier la politique RLS pour autoriser la lecture des competitions `completed` et `is_published = TRUE`.

### IMPORTANT — Winners jamais `announced = TRUE`
**Fichier** : `src/app/[locale]/admin/actions.ts:174-180` et `supabase/migrations/001_initial.sql:169-171`

Le code `drawWinner()` insere un winner sans jamais mettre `announced = TRUE`. La politique RLS `"winners: read announced"` exige `announced = TRUE` pour la lecture. Donc :
- La section "Recent Winners" de la landing page fonctionne uniquement parce qu'elle utilise `createAdminClient` (bypass RLS)
- La requete winners du dashboard (`src/app/[locale]/dashboard/page.tsx:64-68`) utilise le client normal — les winners ne seront **jamais visibles** pour l'utilisateur sauf s'il est admin

**Recommandation** : Soit ajouter `announced: true` dans l'insert du winner, soit modifier la RLS pour que les users voient les winners de leurs propres competitions.

### IMPORTANT — `amount: 0` dans l'insert de secours
**Fichier** : `src/app/api/webhooks/stripe/route.ts:86-95`

Dans le chemin de fallback (quand le payment record n'est pas trouve), le montant est mis a `0` :
```
amount: 0,
```
Le montant reel du paiement est perdu.

**Recommandation** : Recuperer le montant depuis `session.amount_total` de Stripe.

### IMPORTANT — Slug non genere a la creation
**Fichier** : `src/app/[locale]/admin/actions.ts:52-63`

La fonction `createCompetition` n'insere pas de `slug`. Toute competition creee apres les seeds de la migration 003 aura `slug = null`, et ses URLs seront des UUIDs.

**Recommandation** : Generer automatiquement un slug a partir du titre lors de la creation.

### MODERE — ESLint erreurs
4 erreurs et 4 warnings dans le lint :
- `react-hooks/set-state-in-effect` dans `CardCountdownTimer.tsx` et `CountdownTimer.tsx` (setState dans useEffect)
- `react-hooks/exhaustive-deps` dans `PhoneMockup.tsx`

---

## 3. Configuration

### Variables d'environnement — BIEN
Toutes les variables utilisees dans le code sont documentees dans `.env.local.example` :
- `NEXT_PUBLIC_SUPABASE_URL` ✓
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✓
- `SUPABASE_SERVICE_ROLE_KEY` ✓
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` ✓ (dans l'example, pas utilise dans le code source actuel)
- `STRIPE_SECRET_KEY` ✓
- `STRIPE_WEBHOOK_SECRET` ✓
- `RESEND_API_KEY` ✓
- `NEXT_PUBLIC_APP_URL` ✓

### .gitignore — BIEN
- `.env*` ignore (sauf `.env.local.example`) ✓
- `node_modules/`, `.next/` ignores ✓
- Pas de secrets commites

### Email FROM — ATTENTION
**Fichier** : `src/lib/email.ts:6`

```typescript
const FROM = 'WinuWallet <onboarding@resend.dev>'
```
C'est l'adresse sandbox de Resend. Les emails en production ne seront pas delivres correctement.

**Recommandation** : Remplacer par un domaine verifie (e.g., `noreply@winuwallet.com`).

### Stripe — BIEN
- Signature webhook verifiee avec `constructEvent` (`route.ts:27`)
- Checkout session cree cote serveur uniquement
- Montants valides cote serveur (min 1, max 50 tickets, entiers)
- Rate limiting present (bien que en memoire)

### Supabase — BIEN (avec reserves)
- `createAdminClient` (service role) n'est utilise que dans des fichiers serveur (`src/lib/supabase/admin.ts`, actions, API routes, success page)
- **ATTENTION** : `createAdminClient` est appele sur la landing page publique (`src/app/[locale]/page.tsx:33`). C'est un Server Component donc c'est safe, mais c'est une mauvaise pratique — le client normal devrait suffire avec une politique RLS adaptee.
- RLS activee sur toutes les 5 tables ✓

---

## 4. Tests

**Score : 0/100**

Aucun fichier de test trouve dans le projet. Ni test unitaire, ni test d'integration, ni test e2e.

**C'est le point le plus faible du projet.** Pour une application qui gere des paiements reels (Stripe) et des tirages au sort avec des enjeux financiers, l'absence totale de tests est un risque majeur.

**Recommandation prioritaire** :
1. Tests unitaires pour `drawWinner()` (logique critique)
2. Tests d'integration pour le webhook Stripe (idempotence, race conditions)
3. Tests e2e pour le parcours utilisateur (inscription → achat → dashboard)

---

## 5. Qualite

### TypeScript — EXCELLENT
- `tsc --noEmit` : zero erreur ✓
- Zero `any` ou `as any` dans le code ✓
- Zero `@ts-ignore` / `@ts-expect-error` ✓
- Types bien definis dans `src/types/index.ts`

### ESLint — MODERE
- 4 erreurs, 4 warnings (voir section 2)
- Les erreurs sont dans des composants UI (countdown timers), pas dans la logique metier

### Console.log — ATTENTION
20+ `console.log` dans les routes API. Acceptable en developpement, problematique en production.

**Fichiers concernes** :
- `src/app/api/webhooks/stripe/route.ts` : 16 console.log
- `src/app/api/checkout/route.ts` : 4 console.log
- `src/lib/email.ts` : 1 console.log

**Recommandation** : Utiliser un logger structure (e.g., `pino`) avec des niveaux de log configurables.

### i18n — EXCELLENT
- EN et FR complets et synchronises (memes cles dans les deux fichiers)
- Zero chaine en dur dans le JSX detectee dans les pages principales
- **Exception mineure** : quelques labels en dur dans `success/page.tsx` (`"Tickets"`, `"Status"`, `"Your ticket numbers"`) — non internationalises

### Rate Limiting — INSUFFISANT
**Fichier** : `src/app/api/checkout/route.ts:7-21`

Le rate limiter est en memoire (`Map`). Dans un deploiement serverless (Vercel), chaque invocation est potentiellement une nouvelle instance — le rate limiter est donc inefficace.

**Recommandation** : Utiliser Upstash Redis ou Vercel KV pour un rate limiting distribue.

---

## 6. Recommandations priorisees

### CRITIQUE
1. **Corriger la race condition ticket_number** — Ajouter `UNIQUE(competition_id, ticket_number)` + utiliser un compteur atomique ou une sequence DB
2. **Corriger la race condition tickets_sold** — Utiliser `SET tickets_sold = tickets_sold + $count` atomique
3. **Corriger la RLS competitions** — Autoriser la lecture des competitions `completed` + `is_published = TRUE`
4. **Corriger le flag `announced` des winners** — Mettre `announced: true` lors de l'insertion ou ajuster la RLS pour que les users voient leurs propres wins

### IMPORTANT
5. **Ajouter des tests** — Commencer par les routes critiques (webhook, checkout, drawWinner)
6. **Corriger `amount: 0`** dans le fallback du webhook (`route.ts:89`)
7. **Generer des slugs** automatiquement a la creation de competitions
8. **Remplacer l'adresse email FROM** par un domaine verifie
9. **Implementer un rate limiting distribue** (Redis/Upstash)
10. **Verifier que `src/proxy.ts` est bien reconnu** comme middleware par Next.js 16

### AMELIORATION
11. **Remplacer `console.log`** par un logger structure
12. **Corriger les 4 erreurs ESLint** (setState dans useEffect)
13. **Internationaliser les labels en dur** dans `success/page.tsx`
14. **Reduire l'usage de `createAdminClient`** sur la landing page — adapter la RLS pour que le client normal suffise
15. **Ajouter CSRF protection** sur les server actions (Next.js 16 le fait peut-etre nativement, a verifier)

---

## 7. Ce qui n'a PAS pu etre audite

- **RLS en production** : Seules les migrations SQL ont ete lues. L'etat reel de la DB Supabase pourrait differer si des migrations n'ont pas ete appliquees.
- **Deploiement Vercel** : Pas d'acces a la configuration Vercel (env vars reels, domaines, edge config).
- **Stripe Dashboard** : Pas de verification que le webhook endpoint est bien configure cote Stripe, ni que le mode live/test est correct.
- **Performance / Lighthouse** : Aucun test de performance n'a ete execute.
- **Accessibilite** : Audit d'accessibilite non realise (WCAG compliance), bien qu'un `skip-to-content` soit present.
- **Supabase Edge Functions** : Aucune edge function detectee — potentiellement une alternative plus sure pour le webhook.
- **CI/CD pipeline** : Aucun fichier de CI detecte (`.github/workflows/`, `vercel.json`, etc.).
