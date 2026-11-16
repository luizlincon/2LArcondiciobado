# 2L Ar Condicionado: plataforma

Landing page de conversão + sistema de orçamento + painel administrativo (fases seguintes).
Slogan: *Seu ar sempre em dia.* Região: Brasília-DF.

## Stack
React 19, TypeScript, Vite, Tailwind CSS 4, Zod, Vitest. Backend previsto: Supabase (Fase 2). Mapa: Mapbox (Fase 4).

## Rodar
```bash
npm install
cp .env.example .env
npm run dev        # desenvolvimento
npm test           # testes
npm run build      # produção
```

## Variáveis de ambiente
Veja `.env.example`. Sem `VITE_SUPABASE_*` o formulário valida tudo, mas informa que o envio online está indisponível (nada é simulado).

## Modo demonstração
Sem Supabase configurado, em desenvolvimento (ou com `VITE_DEMO_MODE=true`), o painel `/admin` abre sem senha e grava no navegador (localStorage). Há um aviso fixo no topo e o botão para carregar/limpar dados fictícios ("(demo)"). O formulário público grava nesse mesmo armazenamento, para você ver o fluxo completo.
Em produção sem backend e sem a variável, o formulário informa que o envio está indisponível e o admin fica bloqueado.

## Backend (Supabase)
- `supabase/migrations/`: esquema (12 tabelas + `service_catalog`), RLS, buckets privados. Testado em Postgres 16 local: telefone único, conflito de agenda barrado por constraint, fora do expediente recusado, `complete_visit` atômico, anon sem acesso.
- `supabase/functions/submit-quote`: Edge Function pública do formulário (validação, rate limit 5/h por IP, cliente por telefone, idempotência, fotos em bucket privado).
- Falta: criar o projeto, aplicar as migrations, publicar a função, criar o usuário admin (inserir em `profiles`) e trocar `src/admin/db/repo.ts` pelas chamadas ao Supabase (mesmas assinaturas).

## Mapa
Leaflet. Com `VITE_MAPBOX_TOKEN` usa tiles Mapbox; sem token usa OpenStreetMap. Pinos individuais por visita, posicionamento manual, filtros por período e serviço.

- Logo vetorial (SVG) da 2L: a logo atual foi recortada de uma imagem de baixa resolução.
- Fotos reais para antes e depois: `src/content.ts` (`beforeAfter`) e `public/antes-depois/`.
- Fotografia real para o hero.
- Domínio, para sitemap, Open Graph e dados estruturados.
- Revisão jurídica da página `/privacidade` (texto modelo).

## Fases
1. Landing, formulário e upload (concluída)
2. Banco, painel, clientes e solicitações (estruturado; falta ligar ao Supabase)
3. Agenda, atendimentos, equipamentos e histórico (estruturado)
4. Mapa, manutenção e dashboard (estruturado)
5. Segurança, testes, SEO, performance e publicação
