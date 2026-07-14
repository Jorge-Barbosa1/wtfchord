# WTFChord — Roadmap de melhorias

O bounce rate a 100% + a landing atual (que abre diretamente no fretboard sem contexto) são o problema #1. A maior parte do plano ataca isso: dar razão para ficar, criar páginas indexáveis, e polir o resto.

---

## Fase 1 — Reduzir bounce & primeiro impacto (semana 1)

Objetivo: dar a um visitante que caiu no site 5 segundos de "ok, isto é útil e vou tentar".

1. **Hero section acima do fretboard** (na `/`)
  - H1 curto ("What chord is this?"), subheading a explicar em 1 frase
  - 3 badges com prova: "6 tunings", "1200+ chords", "No signup needed"
  - Micro-demo: fretboard já com um Am pré-preenchido + botão "Try identifying this" que dispara animação → resultado. Mostra o valor sem exigir input.
2. **Onboarding contextual** — primeira visita mostra 2 tooltips (tap fret / press identify) que auto-dismissam. Guardado em localStorage.
3. **Estado vazio do painel de resultados** com CTA claro em vez de só "Awaiting input" (adicionar "Or try a preset →" com 4 acordes rápidos: C, G, Dm, F#dim).
4. **Corrigir "Informations" → "Guide"** e rename "History" → "Recent".
5. **Social proof rodapé**: contador de acordes identificados (server-side, incrementado no `onIdentify`, cache 5min).

## Fase 2 — SEO real (semana 1-2)

O site tem só uma rota indexável. Isso mata o SEO — Google não tem nada para rankear.

1. **Chord library route dinâmica** — `/chord/$name` (ex: `/chord/c-major`, `/chord/f-sharp-minor-7`). Gera ~200 páginas cobrindo os acordes mais procurados, cada uma com:
  - Voicings múltiplos (já temos o motor em `voicings.ts`)
  - Notas, intervalos, inversões
  - Head `<title>`, `<description>`, `og:image` gerado server-side com o diagrama
  - JSON-LD `MusicComposition`
  - Sitemap dinâmico (já existe `sitemap[.]xml.ts` — expandir)
2. **Tuning pages** — `/tuning/$id` (standard, drop-d, dadgad, open-g, ukulele, cavaquinho). Cada uma explica a afinação + lista dos 20 acordes mais comuns nessa afinação com link para `/chord/...`.
3. **Landing pages de intenção**:
  - `/guitar-chord-finder` (keyword principal)
  - `/ukulele-chord-finder`
  - `/reverse-chord-lookup`
   Cada uma com H1 dedicado, copy diferente, e embed do fretboard.
4. **Blog em `/blog/$slug**` — 5 posts iniciais escritos manualmente ("How to read chord diagrams", "DADGAD tuning guide", etc.). Não geramos — só a infra do route + MDX.
5. `**robots.txt` + sitemap** — verificar que sitemap inclui todas as rotas novas.
6. **Meta description mais forte na `/**` (a atual funciona mas é longa).

## Fase 3 — Performance (dias)

Lighthouse já dá 99, mas há coisas concretas a limpar:

1. **Google Fonts render-blocking (economia estimada 290ms)** — mover Inter e JetBrains Mono para self-hosted via `vite-imagetools`/`@fontsource`, com `font-display: swap` e preload da variante 700 (usada no H1). Remove os 2 requests externos críticos.
2. **Reduce unused JS (98KB)** — code-split `FindChordSheet`, `HistorySheet`, `InfoSheet`, `CustomTuningSheet`, `PaywallModal` com `lazy()` + `Suspense`. Não são precisos no primeiro paint.
3. **Cache headers** — o worker do `/~flock.js` (7KB) e alguns assets têm TTL curto. Ver se conseguimos aumentar via `wrangler.jsonc` para assets hasheados (1 ano).
4. **Preload do LCP** — o H1 é o LCP; garantir que a font weight 800 preload está no `head` da `/`.

## Fase 4 — Features musicais que retêm (semana 2-3)

Estas transformam o site de "one-shot lookup" em ferramenta que se volta.

1. **Áudio dos acordes** — Web Audio API (sem samples, síntese aditiva simples com envelope) para "play chord" ao lado do resultado. Zero KB de assets, funciona offline.
2. **Shareable chord URLs** — `/?tuning=eadgbe&frets=x,3,2,0,1,0` (ou `/chord/c-major`). Botão "Share" copia URL. Dá viral loop.
3. **Export como imagem** — canvas → PNG do diagrama, com watermark WTFChord. Grande no Instagram/TikTok de professores.
4. **Progression builder** — segunda tab: adicionar múltiplos acordes em sequência, ver progressão. Precisa Pro (feature nova para o paywall).
5. **Scale-to-chord** — dado uma escala, sugerir acordes que encaixam.

## Fase 5 — Backend & Pro (semana 2)

1. **Página de conta `/account**` (rota `_authenticated`):
  - Estado Pro + data ativação
  - Histórico de acordes sincronizado (mover de localStorage para Postgres com RLS)
  - Favoritos sincronizados idem
  - Botão "Delete account" (GDPR)
2. **Sync de histórico/favoritos server-side** — tabela `user_history`, RLS `user_id = auth.uid()`. Fallback local mantido.
3. **Analytics de funil** — Plausible ou PostHog. Eventos: `chord_identified`, `paywall_shown`, `checkout_clicked`, `pro_activated`. Sem isto não sabemos o que optimizar.

## Fase 6 — UX polish (paralelo)

- **Empty state animado** no fretboard antes do primeiro tap
- **Keyboard shortcuts overlay** (`?` mostra atalhos)
- **Undo/redo** no fretboard (Cmd+Z)
- **Dark/light toggle no topbar** em vez de escondido em settings
- **Mobile: bottom sheet para tuning** em vez de dropdown pequeno
- **Acessibilidade**: `aria-label` nas frets ("String 3, fret 2, D natural"), focus rings visíveis, contrast do `text-muted` no light mode

---

## Priorização recomendada

Se só pudéssemos fazer um sprint de 1 semana, faria por esta ordem (impacto em bounce):

1. Hero + micro-demo pré-preenchido (Fase 1.1, 1.2)
2. Chord library dinâmica + sitemap (Fase 2.1, 2.5) — trás tráfego novo
3. Shareable URLs + play áudio (Fase 4.1, 4.2) — dá razão para partilhar
4. Code-split modais + self-host fonts (Fase 3.1, 3.2)
5. Analytics (Fase 5.6) — para medir tudo o resto

## Nota técnica

- Todas as páginas novas usam `head()` per-route com meta/og únicos (rule do stack).
- `og:image` dinâmico por acorde/tuning vai precisar de um server route (`/api/og/chord/$name`) que gera PNG — usar `satori` ou renderizar canvas. Alternativa mais simples: pre-gerar em build time e servir estático.
- Sync de histórico precisa migração + RLS + GRANTs (padrão do projeto).
- Novo bucket de storage não é preciso — tudo texto/JSON.

Diz-me qual das fases queres que ataque primeiro (ou se preferes um subset customizado) e faço um plano de implementação detalhado dessa fase.