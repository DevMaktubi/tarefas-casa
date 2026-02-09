# Tarefas Casa (V1)

Aplicacao simples para registrar tarefas recorrentes em casa, com historico de quem fez e quando foi feito. Nesta V1, nao ha login. As tarefas nao somem quando concluidas, exceto se marcadas como `one and done`.

## Escopo da V1

- Criar tarefas
- Marcar tarefa como concluida por uma pessoa
- Visualizar ultima pessoa e data de conclusao
- Flag `one and done` que arquiva a tarefa ao concluir
- Recorrencia diaria/semanal/mensal com dias especificos
- Filtros por tipo de recorrencia
- Participantes armazenados no banco
- Resumo com graficos e streak global por participante

## Stack

- Next.js (App Router)
- Supabase (Postgres)
- Tailwind CSS
- ApexCharts

## Setup (Passo a passo)

1) Instale dependencias

```bash
npm install
```

2) Crie um projeto no Supabase

3) Rode o SQL do schema

Abra o SQL editor do Supabase e execute o conteudo de `supabase/schema.sql`.

4) Configure variaveis de ambiente

Crie um arquivo `.env.local` na raiz com:

```bash
SUPABASE_URL=coloque_sua_url
SUPABASE_SERVICE_ROLE_KEY=coloque_sua_service_role_key
```

5) (Temporario) Desative RLS

Para esta V1 sem login, a forma mais rapida e desativar o RLS das tabelas `tasks` e `task_completions`. Depois, quando entrar login, criamos politicas.

6) Rode o projeto

```bash
npm run dev
```

Abra `http://localhost:3000`.

## Comando para saber onde voce esta no projeto

```bash
pwd
git status -sb
```

## Estrutura basica

- `src/app/page.tsx`: UI principal
- `src/app/api/tasks`: endpoints da API
- `src/lib/supabaseServer.ts`: cliente Supabase server-side
- `supabase/schema.sql`: schema do banco

## Processo de trabalho (Planner -> Developer -> Reviewer)

Este projeto segue um fluxo leve de agentes, com arquivos que definem responsabilidades e templates.

- Planner: `/Users/devmaktub/Desktop/Programas/Codex/tarefas-casa/agents/planner.md`
- Developer: `/Users/devmaktub/Desktop/Programas/Codex/tarefas-casa/agents/developer.md`
- Reviewer: `/Users/devmaktub/Desktop/Programas/Codex/tarefas-casa/agents/reviewer.md`

Processo detalhado:
- `/Users/devmaktub/Desktop/Programas/Codex/tarefas-casa/docs/process.md`

## Documentacao adicional

- Ideia geral: `/Users/devmaktub/Desktop/Programas/Codex/tarefas-casa/docs/idea.md`
- Padroes do projeto: `/Users/devmaktub/Desktop/Programas/Codex/tarefas-casa/docs/architecture.md`
- Onde ficam os arquivos importantes: `/Users/devmaktub/Desktop/Programas/Codex/tarefas-casa/docs/where.md`

## Proximos passos (quando quiser)

- Autenticacao e perfis por usuario
- RLS com politicas de acesso
- Lembretes e automacoes
