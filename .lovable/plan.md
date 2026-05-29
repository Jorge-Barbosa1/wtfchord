
## Objetivo

Adicionar contas de utilizador ao WTFChord para que o estado Pro seja sincronizado entre dispositivos via backend (Lovable Cloud), em vez de viver só no `localStorage`.

## O que vai ser feito

### 1. Ativar Lovable Cloud
Provisiona Postgres + Auth automaticamente. Sem custos adicionais para começar.

### 2. Base de dados
Tabela `profiles`:
- `id` (uuid, FK → `auth.users`, PK)
- `email` (text)
- `is_pro` (bool, default false)
- `pro_activated_at` (timestamptz, nullable)
- `created_at` (timestamptz, default now)

RLS: cada user só lê/edita o seu próprio profile. Trigger automático cria profile no signup.

### 3. Autenticação
- Email/password + Google (via broker do Lovable).
- Página `/login` (com tabs sign in / sign up).
- Login **opcional** — a app continua a funcionar sem conta. Só é pedido quando o user quer comprar Pro ou sincronizar.
- Botão "Sign in" no `Topbar` (substitui o nada que está lá agora quando não autenticado). Quando autenticado, mostra email + logout.

### 4. Stripe — passar de `?activated=true` para webhook server-side
**Atual:** o user paga, é redirecionado com `?activated=true`, e marcamos Pro no localStorage. Frágil (qualquer um pode adicionar `?activated=true` no URL).

**Novo:**
- Server route público em `/api/public/stripe-webhook` que:
  - Valida assinatura do webhook do Stripe.
  - No evento `checkout.session.completed`, faz match do user (por `client_reference_id` = user.id, ou por email) e marca `is_pro = true`.
- No `PaywallModal`, o link de checkout passa a incluir `client_reference_id` e prefill do email do user autenticado.
- Secrets necessários: `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` (pedidos ao user quando chegarmos a esse passo).
- O `?activated=true` deixa de ser usado como fonte de verdade — fica só como hint de "obrigado pela compra" e refresca o estado a partir do servidor.

### 5. Hook `useProStatus` refeito
Estratégia híbrida (sem partir nada):
- **Autenticado:** lê `is_pro` do profile via TanStack Query (server function). Esta é a fonte de verdade.
- **Não autenticado:** continua a ler do `localStorage` (fallback para Pro users existentes que ainda não criaram conta).
- **Claim automático:** quando um user faz login pela primeira vez e o `localStorage` tem `pro: true`, uma server function `claimLegacyPro` marca `is_pro = true` no profile dele e limpa o localStorage. Sem novo pagamento.

### 6. UI changes
- `Topbar`: avatar/email + dropdown com Logout quando autenticado; botão "Sign in" quando não.
- `PaywallModal`: 
  - Se não autenticado → step 1 "Cria conta para guardar o teu Pro em todos os dispositivos" com botões de signup.
  - Se autenticado → vai direto para Stripe com `client_reference_id`.

### 7. Mobile fix (bónus pequeno)
Verificar que o novo botão de account no `Topbar` cabe bem no menu hamburger mobile.

## Detalhes técnicos

**Stack:** TanStack Start + Lovable Cloud (Supabase por baixo). Server functions com `createServerFn` + `requireSupabaseAuth` para reads/writes scoped ao user. Server route em `src/routes/api/public/stripe-webhook.ts` para o webhook (bypassa auth, valida assinatura).

**Ficheiros novos:**
- `src/routes/login.tsx`
- `src/routes/api/public/stripe-webhook.ts`
- `src/lib/profile.functions.ts` (getProfile, claimLegacyPro)
- `src/components/chord-detective/AuthButton.tsx`

**Ficheiros editados:**
- `src/hooks/useProStatus.ts` (estratégia híbrida)
- `src/components/chord-detective/Topbar.tsx` (auth UI)
- `src/components/chord-detective/PaywallModal.tsx` (client_reference_id)
- `src/routes/__root.tsx` (onAuthStateChange listener)
- `src/routes/index.tsx` (remover lógica do `?activated=true` baseada em localStorage; passar a refetch profile)

**Migração SQL:** tabela `profiles`, grants, RLS, trigger `handle_new_user`.

## Ordem de execução

1. Ativar Lovable Cloud + criar tabela `profiles`.
2. Páginas auth + Topbar com login/logout.
3. `useProStatus` híbrido + claim legacy.
4. `PaywallModal` com `client_reference_id`.
5. Pedir secrets do Stripe + implementar webhook.
6. Testar fluxo end-to-end.

## Fora de scope

- Histórico de pagamentos / faturas no UI.
- Cancelamento de subscrição (o produto é pagamento único de €4,99, não subscrição).
- Profile editing (avatar, nome, etc.) — `profiles` fica minimalista.
