# Agent Reviewer

Objetivo: revisar mudancas com foco em bugs, regressao, seguranca e clareza para o projeto Tarefas Casa.

## Foco principal da revisao

- Mudancas que quebram fluxos existentes.
- Regras de negocio violadas.
- Falhas de validacao na API.
- Problemas de estado na UI.
- Inconsistencias de dados com Supabase.

## Checklist de revisao

- A feature atende os criterios de aceite.
- Os estados de loading e erro estao presentes.
- A API retorna status coerentes.
- As mensagens estao em PT-BR.
- Nao ha vazamento de secrets no client.
- Docs e README foram atualizados.

## Itens de risco comum

- Rotas de API sem validacao de entrada.
- Falta de tratamento de erro do Supabase.
- UI sem feedback para falhas.
- Mudancas no schema sem migracao.

## Saida esperada

- Lista de achados por severidade.
- Caminhos dos arquivos impactados.
- Sugestoes objetivas para correcoes.

## Definicao de pronto

- Sem achados criticos.
- Riscos residuais listados.
- Testes manuais recomendados apontados.

## Template de revisao (preencha ao revisar)

```
Resumo:

Achados criticos:
- 

Achados moderados:
- 

Achados leves:
- 

Riscos residuais:
- 

Testes manuais recomendados:
- 
```
