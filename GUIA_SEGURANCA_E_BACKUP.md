# 🛡️ Guia de Segurança e Rotina de Backups do Sanity

Este guia foi elaborado para proteger o sistema contra perda de dados, invasões ou exclusões acidentais, garantindo que você tenha controle total sobre as Chamadas Públicas e documentos cadastrados.

---

## 1. 📦 Rotina de Backups (Como nunca perder nada)

O Sanity salva todos os dados em nuvem com réplicas e alta disponibilidade, mas ter backups externos em seu computador ou nuvem pessoal garante 100% de autonomia e tranquilidade.

### Como gerar um backup com 1 comando:

Você pode executar o backup a partir de qualquer terminal:

**Opção A — A partir da pasta principal do projeto:**
```bash
npm run studio:backup
```

**Opção B — Dentro da pasta `studio`:**
```bash
cd studio
npm run backup
```

### O que o script faz:
1. Conecta ao dataset `production` do Sanity.
2. Exporta **todos os documentos**, linhas do tempo, links e referências.
3. Compacta tudo em um arquivo `.tar.gz` com a data e hora exatas da exportação.
4. Salva o arquivo na pasta `studio/backups/` (ex: `backup-production-2026-09-06_01-35-10.tar.gz`).
5. A pasta de backups é ignorada pelo Git para não enviar dados pesados para o repositório.

### Onde guardar os backups:
> [!TIP]
> Periodicamente, copie os arquivos gerados na pasta `studio/backups/` para uma pasta segura em nuvem (ex: **Google Drive institucional**, **OneDrive** ou um **HD externo**).

---

## 2. 🔄 Como Restaurar um Backup

Se alguém deletar um edital por engano ou se você quiser restaurar o sistema exatamente como estava:

1. Abra o terminal na pasta `studio`:
   ```bash
   cd studio
   ```
2. Execute o comando de importação apontando para o arquivo de backup desejado:
   ```bash
   npx sanity dataset import backups/backup-production-AAAA-MM-DD_HH-mm-ss.tar.gz production --replace
   ```
   *(Substitua pelo nome real do arquivo gerado no seu backup).*

---

## 3. 🕒 Histórico Nativo de Revisões no Sanity Studio (Restaurar sem precisar de backup)

O Sanity possui um sistema interno de controle de versão muito parecido com o Google Docs:

1. Abra o **Sanity Studio**.
2. Clique na chamada pública que você deseja verificar.
3. No canto superior direito, clique no ícone de **Relógio** ("History" ou "Review changes").
4. O Sanity mostrará cada alteração feita, quem alterou e quando.
5. Você pode navegar pelas versões anteriores e clicar em **"Restore"** para reverter qualquer documento ao estado original com 1 clique!

---

## 4. 🔒 Configurações de Segurança do Sanity

Para garantir que apenas pessoas e domínios autorizados interajam com o sistema, siga os passos abaixo no painel administrativo:

### A. Restringir Origens CORS (Quem pode acessar a API)
1. Acesse: **[https://manage.sanity.io](https://manage.sanity.io)** e faça login.
2. Selecione o projeto do sistema (`sate-portal-cms` / `mktsf3hv`).
3. Clique na aba **API** e desça até a seção **CORS Origins**.
4. Verifique as origens cadastradas:
   - Adicione `http://localhost:5173` (para testes locais do portal Vite).
   - Adicione `http://localhost:3333` (para o Sanity Studio local).
   - Adicione o domínio oficial na Vercel (ex: `https://sistem-cp.vercel.app` ou seu domínio institucional).
5. **Atenção**:
   - Remova qualquer entrada genérica com asterisco `*`.
   - Mantenha a opção **"Allow credentials"** desmarcada para acessos públicos de leitura.

---

### B. Gestão de Membros e Autenticação em 2 Etapas (2FA)
1. No painel do Sanity ([manage.sanity.io](https://manage.sanity.io)), clique na aba **Members**.
2. Revise a lista de usuários com acesso:
   - Conceda o perfil de **Administrator** apenas aos responsáveis técnicos diretos.
   - Para pessoas que apenas cadastram ou atualizam editais, use o perfil **Editor**.
   - Remova acessos de pessoas que não fazem mais parte da equipe.
3. **Exigência de 2FA**:
   - Recomende que todos os membros tenham autenticação em 2 fatores (2FA via app autenticador) ativada na conta Google/GitHub/Sanity com a qual fazem login.

---

### C. Proteção de Tokens de API
- O código do site (`src/sanityClient.js`) faz apenas leituras públicas (`projectId` e `dataset`). Isso é **totalmente seguro** e o padrão da arquitetura Jamstack.
- **Regra fundamental**: Nunca adicione tokens de escrita com perfil de *Editor* ou *Administrator* dentro do frontend do site ou em variáveis com prefixo `VITE_` no `.env`, pois elas ficam visíveis no navegador de qualquer visitante. Edições e publicações devem sempre ocorrer via **Sanity Studio**.

---

## 5. 📋 Resumo Rápido

| Ação | Como fazer |
| :--- | :--- |
| **Fazer Backup** | Rodar `npm run studio:backup` na raiz do projeto |
| **Restaurar Backup** | Rodar `npx sanity dataset import [arquivo] production --replace` na pasta `studio` |
| **Recuperar Versão Anterior** | Clicar no ícone de relógio ("History") dentro do Sanity Studio |
| **Ajustar Permissões e CORS** | Acessar o painel em [manage.sanity.io](https://manage.sanity.io) |
