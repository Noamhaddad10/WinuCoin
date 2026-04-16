# Journal de développement — WinuWallet

## 2026-04-16 — Corrections post-audit

**Commit** : `f45f596` (squash merge sur main)
**Branche** : `feature/audit-fixes` (supprimée)
**Audit** : `docs/audit-report-2026-04-16.md` — Score 62/100 → estimé 80+

### Changements

- **Migration SQL 004** : contrainte UNIQUE tickets, RLS competitions élargie, RLS winners "read own", RPC atomique `increment_tickets_sold` avec REVOKE/GRANT
- **Webhook Stripe** : fix race conditions (retry + UNIQUE), montant récupéré depuis Stripe, logs nettoyés
- **Admin actions** : slug auto-généré + dédupliqué, `announced: true` sur winner
- **Email** : FROM configurable via `EMAIL_FROM`
- **ESLint** : 0 erreur (useSyncExternalStore + useCallback pour les timers, fix purity)
- **i18n** : 4 nouvelles clés EN+FR dans success page

### Risque résiduel accepté

- Ticket numbering : retry simple (suffisant pour un MVP à faible concurrence)
- Rate limiting : toujours en mémoire (TODO pour Redis/Upstash)
