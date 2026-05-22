# MEDARA — Frontend (PWA)

## O que é
App de saúde corporativa inteligente. PWA (Progressive Web App) — funciona como app nativo no celular sem precisar de loja. Voltado para empresas que querem oferecer saúde para seus funcionários.

## Cliente atual
- **Empresa:** Leal Castro
- **Código de acesso:** LEAL2026
- **Gestor:** adm@lealcastro.com.br / Gestor@123
- **Funcionários de teste:** pedro@lealcastro.com.br, adriana@lealcastro.com.br, vanessa@lealcastro.com.br (senha: Medara@123)

## Stack
- HTML + CSS + JavaScript puro (SPA em arquivo único: index.html)
- PWA com manifest.json + sw.js + ícones em /icons/
- Deploy na Vercel: https://medara-web.vercel.app
- Apresentação para empresários: /apresentacao.html

## Estrutura do app
- SPA com roteamento via `goTo(id)` e `goTab(i)`
- Telas principais: s-splash, s-login, s-home, s-consultas, s-agendamento, s-ativa, s-historico, s-perfil, s-dashboard
- Telas gestor: s-gestor-home, s-gestor-equipe, s-gestor-alertas
- Telas perfil: s-dados-pessoais, s-plano-familiar, s-documentos, s-meu-plano, s-vantagens, s-pagamentos, s-notificacoes, s-privacidade, s-ajuda
- Telas extras: s-receitas, s-exames, s-primeiro-acesso

## Funcionalidades implementadas
- Login por role (funcionário → s-home, gestor → s-gestor-home)
- Seletor de role animado (badge "Funcionário/Gestor" no login)
- Primeiro acesso (2 passos: dados + senha + LGPD)
- In-app browser (IAB) — abre URLs dentro do app sem sair
- Videochamada via Agora.io (WebRTC) — tela s-ativa com câmera real
- Backup manual pelo gestor (botão verde no painel)
- Dashboard gestor com burnout por setor, alertas, score corporativo
- Clube de Vantagens com 6 parceiros (todos abrem in-app)
- Dashboard IA do funcionário (score de saúde, insights)
- Toast notifications (função showToast)
- Health score mini no header
- Eye toggle (ocultar dados sensíveis)
- Challenge card gamificação
- Sugestões inteligentes (Nubank-style)

## Segurança (frontend)
- CSP completo no vercel.json (incluindo Agora SDK CDN)
- X-Frame-Options, HSTS, X-Content-Type-Options, Referrer-Policy
- escapeHtml() em todos os innerHTML com dados externos
- Dados do usuário sempre via textContent (nunca innerHTML)
- media-src: blob: (necessário para WebRTC/câmera)

## Videochamadas (Agora.io)
- SDK: AgoraRTC_N-4.20.0.js (carregado do CDN)
- App ID: configurar na variável `AGORA_APP_ID` no index.html (linha ~3500)
- Modo demo funciona sem App ID (só abre câmera local)
- Conta grátis: https://console.agora.io (10.000 min/mês grátis)

## Como fazer deploy
```
cd C:\Users\Alvaro\medara-web
vercel --prod --yes
```

## Como fazer push para GitHub
```
cd C:\Users\Alvaro\medara-web
git add .
git commit -m "descrição da mudança"
git push
```
Repo: https://github.com/BondeDaEcko/medara-web

## Pendências principais
- [ ] Conectar frontend ao backend real (trocar TEST_USERS por chamadas API)
- [ ] Implementar dashboard gestor com dados reais do banco
- [ ] 2FA (autenticação em dois fatores)
- [ ] Audit log de ações
- [ ] Portal LGPD (exportar/deletar dados)
- [ ] Integração Memed (receitas digitais com validade legal)
- [ ] Notificações push reais (email/SMS/WhatsApp)
