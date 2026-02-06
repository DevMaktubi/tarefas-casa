# Padroes do Projeto

## Arquitetura de pastas

- `src/app` fica a UI e as rotas da API.
- `src/lib` fica a integracao com Supabase e tipos.
- `supabase` guarda o schema SQL.
- `docs` guarda documentacao do projeto.
- `agents` guarda os guias de trabalho para agentes.

## Padroes de API

- Endpoints seguem `src/app/api/<recurso>/route.ts`.
- Validacao de entrada e respostas com erro em PT-BR.
- Usar status HTTP coerentes.

## Padroes de UI

- Uma pagina principal simples enquanto a V1 nao cresce.
- Estados obrigatorios de loading, erro e vazio.
- Conteudo em PT-BR.

## Padroes de dados

- Tarefas nao somem ao concluir.
- `one and done` arquiva ao concluir.
- Historico sempre registra quem concluiu e quando.
