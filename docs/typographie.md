# Hiérarchie typographique — Café Céramique

> Document de référence DA. Mettre à jour ici en premier, puis reporter dans `app/fonts.ts` et `app/globals.css`.

---

## Polices actives

| Rôle | Famille | Fichier / Source | Variable CSS |
|------|---------|-----------------|--------------|
| **Primaire** (corps + titres) | Cal Sans | `app/fonts/cal-sans.woff2` | `--font-primary` |
| **Monospace** (tokens, timers) | Geist Mono | Google Fonts | `--font-mono` |

**Changer la police primaire** → modifier uniquement `app/fonts.ts`, bloc `fontPrimary`.

---

## Échelle typographique

| Niveau | Balise | Tailwind | px | Graisse | Espacement | Usage |
|--------|--------|----------|----|---------|------------|-------|
| Display | `<p>` | `text-7xl font-bold` | 72 | 700 | — | Compteur participants géant |
| H1 Large | `<h1>` | `text-3xl font-bold` | 30 | 700 | `tracking-tight` | Titre page d'accueil session |
| H1 | `<h1>` | `text-2xl font-bold` | 24 | 700 | — | Titre principal de page |
| H2 | `<h2>` | `text-xl font-bold` | 20 | 700 | — | Titre de section / étape |
| H3 | `<p>` | `text-lg font-bold` | 18 | 700 | — | Marque nav, sous-sections |
| Stat / KPI | `<p>` | `text-3xl font-bold` | 30 | 700 | — | Valeurs dashboard |
| Overline | `<p>` | `text-xs font-semibold uppercase tracking-widest` | 12 | 600 | +widest | Labels catégorie, filtres |
| Corps | `<p>` | `text-sm` | 14 | 400 | +0.05em | Texte courant (global) |
| Corps petit | `<p>` | `text-xs` | 12 | 400 | — | Métadonnées, prix, hints |
| Token mono | `<p>` | `text-2xl font-mono font-bold tracking-wider` | 24 | 700 | +wider | Token `CER-MMDD-T00-XXX` |
| Timer mono | `<p>` | `text-2xl font-mono font-bold tabular-nums` | 24 | 700 | tabular | Compte à rebours session |

---

## Points de décision DA à trancher

- [ ] **H1 unifié ?** Actuellement `text-2xl` sur la plupart des pages, `text-3xl` sur la session active — à harmoniser
- [ ] **Graisse H2** : tous en `font-bold` (700), envisager `font-semibold` (600) pour alléger
- [ ] **Police corps** : Cal Sans est une display font (400 uniquement) — prévoir une police de lecture pour les longs textes (ex: confirmations, CGV)
- [ ] **Italic / second weight** : Cal Sans n'a pas d'italique — décision à prendre pour les emphases
- [ ] **Couleurs typographiques** : actuellement `text-gray-900` / `text-gray-500` / `text-gray-400` — à mapper sur tokens sémantiques quand la palette DA sera définie

---

## Fichiers à modifier lors d'un changement DA

| Quoi changer | Où |
|---|---|
| Police primaire | [`app/fonts.ts`](../app/fonts.ts) — bloc `fontPrimary` |
| Police mono | [`app/fonts.ts`](../app/fonts.ts) — bloc `fontMono` |
| Tailles / graisses globales | [`app/globals.css`](../app/globals.css) — `@layer base` |
| Tailles par niveau | Composants individuels (grep `text-2xl`, `text-xl`, etc.) |
