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

## Pendências de conteúdo
- Logo vetorial (SVG) da 2L: a logo atual foi recortada de uma imagem de baixa resolução.
- Fotos reais para antes e depois: `src/content.ts` (`beforeAfter`) e `public/antes-depois/`.
- Fotografia real para o hero.
- Domínio, para sitemap, Open Graph e dados estruturados.
- Revisão jurídica da página `/privacidade` (texto modelo).

## Fases
1. Landing, formulário e upload (concluída)
2. Banco, autenticação, painel, clientes e solicitações
3. Agenda, atendimentos, equipamentos e histórico
4. Mapa, manutenção e dashboard
5. Segurança, testes, SEO, performance e publicação
