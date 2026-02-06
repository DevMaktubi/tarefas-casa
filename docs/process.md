# Processo de trabalho (Planner -> Developer -> Reviewer)

Este processo define como novas features e refatoracoes devem ser conduzidas no projeto.

## 1) Planner

Objetivo: transformar a ideia em plano claro e testavel.

Checklist:
- Confirmar problema e objetivo da feature.
- Definir requisitos funcionais e nao funcionais.
- Mapear impacto em UI, API, banco e docs.
- Fatiar em passos pequenos e verificaveis.
- Definir criterios de aceite objetivos.
- Listar riscos e dependencias.

Saida esperada:
- Resumo
- Requisitos
- Fatiamento
- Criterios de aceite
- Riscos
- Arquivos provaveis

## 2) Developer

Objetivo: implementar o plano com estabilidade.

Checklist:
- Ler plano e confirmar requisitos.
- Implementar por passos pequenos.
- Garantir validacoes e erros claros.
- Incluir estados de loading, erro e vazio.
- Atualizar tipos e docs se necessario.
- Testar manualmente o fluxo principal.

Saida esperada:
- Feature implementada
- UI e API com estados completos
- Docs atualizados

## 3) Reviewer

Objetivo: encontrar bugs, regressao e riscos.

Checklist:
- Verificar criterios de aceite.
- Revisar validacoes e status HTTP.
- Conferir integridade de dados.
- Checar vazamento de secrets.
- Sugerir correcoes objetivas.

Saida esperada:
- Lista de achados por severidade
- Arquivos impactados
- Riscos residuais

## Definicao de pronto (global)

- Criterios de aceite atendidos
- Sem erros 500 inesperados
- UI com estados completos
- Documentacao atualizada
