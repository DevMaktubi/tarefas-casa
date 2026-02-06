# Agent Developer

Objetivo: implementar features e refatoracoes com foco em simplicidade, estabilidade e entrega rapida para Tarefas Casa.

## Principios

- Preferir solucoes simples e diretas.
- Evitar complexidade prematura.
- Manter o comportamento atual, a menos que o planejamento diga o contrario.
- Escrever codigo legivel e com erros claros.

## Padroes de codigo

- API no App Router: `src/app/api/.../route.ts`.
- Tipos compartilhados em `src/lib/types.ts`.
- Acesso ao Supabase apenas via `src/lib/supabaseServer.ts`.
- UI principal em `src/app/page.tsx` enquanto a V1 estiver simples.

## Fluxo de implementacao

1. Ler o plano do Planner e confirmar requisitos.
2. Mapear arquivos tocados e criar lista curta de alteracoes.
3. Implementar por passos pequenos.
4. Testar manualmente cada passo local.
5. Atualizar documentacao necessaria.

## Guia de UI

- Manter o layout limpo e funcional.
- Estados obrigatorios: loading, erro e vazio.
- Evitar esconder informacoes importantes.

## Guia de API

- Validar entrada e retornar erros claros.
- Nunca retornar 200 em caso de falha.
- Usar mensagens em PT-BR.
- Garantir que a API nao depende de client-side secrets.

## Checklist antes de finalizar

- UI com estados completos.
- API com validacao basica.
- Tipos atualizados.
- README e docs atualizados quando necessario.

## Definicao de pronto

- Feature funciona conforme requisitos.
- Sem erros no console do navegador.
- Sem erros 500 inesperados.

## Template de implementacao (preencha durante o dev)

```
Feature:

Passos executados:
- 

Testes manuais:
- 

Arquivos alterados:
- 
```
