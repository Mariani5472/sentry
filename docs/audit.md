# Audit e plano de execução — Epic KAN-97

## Objetivo

Este documento organiza os tickets **KAN-98 até KAN-109**, explica o que fazer em cada etapa e mostra a ordem mais segura para construir o projeto.

O repositório ainda está praticamente vazio. Antes dos tickets funcionais, será necessário preparar a estrutura básica do monorepo.

O produto será um Sentry simplificado:

```text
Demo Express
     ↓
SDK Node.js
     ↓
Collector/API
     ↓
PostgreSQL
     ↓
API de consulta
     ↓
Dashboard React
```

## Resultado esperado da epic

Ao final da KAN-97, outra pessoa deverá conseguir:

1. executar o projeto seguindo o README;
2. provocar um erro na aplicação Express de demonstração;
3. enviar o erro automaticamente pelo SDK;
4. persistir o evento no PostgreSQL;
5. agrupar ocorrências equivalentes em uma issue;
6. encontrar a issue e suas ocorrências no dashboard;
7. visualizar métricas básicas de erro e latência;
8. repetir o fluxo localmente e na versão publicada;
9. entender as decisões e limitações do projeto.

## O que você precisa ter

- Git;
- Node.js em versão LTS;
- pnpm;
- Docker e Docker Compose;
- PostgreSQL local ou gerenciado;
- Bruno, Postman, Insomnia ou outro cliente HTTP;
- acesso à epic KAN-97 e aos tickets KAN-98 a KAN-109;
- serviços para publicar API, web e PostgreSQL.

Antes de programar, confirme:

- nome definitivo do produto e do SDK;
- framework HTTP da API;
- biblioteca de banco e migrations;
- formato da DSN ou API key;
- padrão de branches e pull requests;
- comandos obrigatórios do CI.

O nome `TraceFlow` apareceu na conversa inicial, mas ainda precisa ser confirmado.

## Estrutura recomendada

Use um monorepo com pnpm workspace:

```text
sentry/
├── api/                     # Collector e API de consulta
├── web/                     # Dashboard React
├── packages/
│   └── sdk-node/            # SDK Node.js
├── demo/
│   └── express-app/         # Aplicação end-to-end
├── migrations/              # Migrations do PostgreSQL
├── docs/
│   ├── architecture.md
│   ├── event-contract.md
│   ├── fingerprint.md
│   ├── benchmark.md
│   └── decisions/
├── .github/
│   └── workflows/           # CI
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

O collector e a API do dashboard podem ficar juntos em `api/` no MVP. Não há necessidade de microsserviços.

## Preparação do repositório

Esta preparação é necessária antes dos tickets. Se não existir um ticket próprio, registre o trabalho na KAN-97 ou confirme com o responsável antes de criar uma tarefa nova.

- [ ] Criar as pastas do monorepo.
- [ ] Configurar o pnpm workspace.
- [ ] Preparar TypeScript e configurações compartilhadas.
- [ ] Criar comandos de desenvolvimento, build, lint, typecheck e testes.
- [ ] Criar `.env.example` sem segredos.
- [ ] Preparar Docker Compose para o PostgreSQL local.
- [ ] Iniciar a API com uma rota simples de saúde.
- [ ] Explicar no README como subir o ambiente inicial.

**Pronto quando:** o workspace instala as dependências, a API inicia e o banco local fica acessível.

## Mapa dos tickets e dependências

| Ticket  | Entrega principal             | Depende principalmente de           |
| ------- | ----------------------------- | ----------------------------------- |
| KAN-98  | Contrato de eventos e banco   | Preparação do repositório           |
| KAN-99  | Projetos e API keys           | KAN-98                              |
| KAN-100 | Ingestão de eventos           | KAN-98 e KAN-99                     |
| KAN-101 | SDK Node.js mínimo            | KAN-98 e KAN-100                    |
| KAN-102 | Captura automática no Express | KAN-101                             |
| KAN-103 | Fingerprint e issues          | KAN-98 e KAN-100                    |
| KAN-104 | Consultas e métricas          | KAN-102 e KAN-103                   |
| KAN-105 | Dashboard React               | KAN-104                             |
| KAN-106 | Demo end-to-end               | KAN-101, KAN-102, KAN-104 e KAN-105 |
| KAN-107 | Deploy e operação             | Fluxo end-to-end funcional          |
| KAN-108 | Arquitetura e decisões        | Todos os tickets relevantes         |
| KAN-109 | Benchmark e portfólio         | KAN-106 e KAN-107                   |

A documentação da KAN-108 deve ser atualizada durante todo o projeto. A base da demo pode ser criada cedo, mas a KAN-106 só termina quando o fluxo chegar ao dashboard.

## Ordem detalhada do trabalho

### 1. KAN-98 — Contrato de eventos e modelo de dados

Esta é a base do restante do projeto. Não comece pelo dashboard ou pelo SDK antes de definir o que a API receberá.

- [ ] Definir o contrato mínimo do evento.
- [ ] Documentar `eventId`, `projectId`, `timestamp` e `environment`.
- [ ] Documentar `exception`, `request`, `duration` e `tags`.
- [ ] Marcar campos obrigatórios e opcionais.
- [ ] Definir formatos, limites e exemplos válidos.
- [ ] Modelar projetos, API keys, eventos e issues.
- [ ] Definir relacionamentos e índices iniciais.
- [ ] Criar e testar as migrations em um banco vazio.
- [ ] Persistir um evento mínimo para validar o schema.

Cuidados:

- Confirme se `projectId` precisa vir no payload, pois o collector também pode resolvê-lo pela API key.
- `exception` e `request` podem ser opcionais: um evento pode representar erro ou performance.
- Não incluir tracing distribuído ou OpenTelemetry.

**Concluído quando:** a migration roda do zero, um evento mínimo pode ser salvo e o contrato está documentado.

### 2. KAN-99 — Projects e API Keys

Este ticket cria a autenticação das aplicações que enviam eventos. Ele não define login do dashboard.

- [ ] Criar o CRUD mínimo de projetos.
- [ ] Gerar uma API key por projeto.
- [ ] Mostrar o segredo completo apenas na criação.
- [ ] Guardar somente hash ou representação segura.
- [ ] Permitir revogar uma chave.
- [ ] Criar middleware que lê a credencial e encontra o projeto.
- [ ] Rejeitar chave inexistente ou revogada.
- [ ] Impedir segredos em logs.
- [ ] Testar chave válida, inválida e revogada.

**Concluído quando:** uma chave válida identifica um projeto e nenhuma resposta posterior expõe o segredo.

### 3. KAN-100 — Endpoint de ingestão

Aqui nasce o primeiro caminho vertical do produto.

- [ ] Criar `POST /v1/events`.
- [ ] Autenticar pela API key.
- [ ] Resolver o projeto pelo middleware da KAN-99.
- [ ] Validar o contrato da KAN-98.
- [ ] Gerar ou validar o `eventId`, conforme decisão documentada.
- [ ] Normalizar e persistir o evento.
- [ ] Garantir idempotência pelo `eventId` também no banco.
- [ ] Padronizar respostas de sucesso e erro.
- [ ] Testar manualmente sem o SDK.
- [ ] Testar payload inválido, chave inválida e reenvio.

**Concluído quando:** evento válido é salvo, inválidos recebem 4xx, chave inválida recebe 401/403 e o mesmo `eventId` não duplica dados.

### 4. KAN-101 — SDK Node.js mínimo

O SDK deve esconder detalhes da API e nunca prejudicar a aplicação monitorada.

- [ ] Criar o pacote em `packages/sdk-node`.
- [ ] Implementar `init()` e `captureException()`.
- [ ] Configurar DSN/API key e `environment`.
- [ ] Serializar a exception conforme a KAN-98.
- [ ] Enviar pelo transporte HTTP.
- [ ] Usar timeout curto.
- [ ] Tratar falhas do collector internamente.
- [ ] Evitar promises rejeitadas sem tratamento.
- [ ] Testar serializador e transporte.

**Concluído quando:** uma aplicação envia uma exception e continua funcionando mesmo se o collector estiver indisponível.

### 5. KAN-102 — Captura automática para Express

Comece somente depois que `captureException()` funcionar manualmente.

- [ ] Criar middleware de request.
- [ ] Capturar método, rota, status e duração.
- [ ] Criar error middleware para exceptions não tratadas.
- [ ] Mascarar `authorization`, `cookie` e dados sensíveis.
- [ ] Definir limites para headers e payloads.
- [ ] Testar request normal, request lento e exception.

**Concluído quando:** requests geram dados mínimos de performance, exceptions são capturadas e credenciais não são enviadas.

### 6. KAN-103 — Fingerprint e agrupamento

Esta etapa transforma eventos isolados em issues úteis.

- [ ] Definir a estratégia inicial de fingerprint.
- [ ] Normalizar partes variáveis da mensagem quando necessário.
- [ ] Considerar tipo do erro e frames úteis da stack.
- [ ] Criar uma issue se o fingerprint não existir.
- [ ] Associar eventos equivalentes à issue existente.
- [ ] Atualizar `firstSeen`, `lastSeen` e contagem.
- [ ] Evitar agrupar erros diferentes só pela mensagem genérica.
- [ ] Isolar e documentar o algoritmo para permitir evolução.
- [ ] Testar erros iguais e erros parecidos, mas diferentes.

**Concluído quando:** ocorrências equivalentes atualizam a mesma issue e erros diferentes permanecem separados.

### 7. KAN-104 — API de consultas e métricas

O frontend deve consumir somente a API, nunca o PostgreSQL diretamente.

- [ ] Criar listagem paginada de issues.
- [ ] Adicionar filtros por período e `environment`.
- [ ] Criar detalhes da issue e ocorrências paginadas.
- [ ] Calcular total de requests e erros.
- [ ] Calcular `error rate` com fórmula documentada.
- [ ] Calcular P50, P95 e P99 com amostra suficiente.
- [ ] Definir o resultado quando a amostra for insuficiente.
- [ ] Definir fuso horário e limites dos períodos.
- [ ] Validar métricas com dados conhecidos.

**Concluído quando:** o dashboard puder ser construído usando apenas endpoints paginados da API.

### 8. KAN-105 — Dashboard React

O foco é investigação simples e funcional, não copiar todo o Sentry.

- [ ] Criar a aplicação React em `web/`.
- [ ] Criar overview com métricas.
- [ ] Criar lista de issues.
- [ ] Criar detalhes da issue.
- [ ] Exibir stack trace legível e ocorrências.
- [ ] Criar filtros de período e ambiente.
- [ ] Tratar loading, vazio e erro da API.
- [ ] Confirmar que não existe acesso direto ao banco.

**Ponto a confirmar:** os tickets não definem login do dashboard. Não adicione autenticação de usuário ou Supabase Auth sem confirmar se isso pertence à KAN-97.

**Concluído quando:** um erro enviado pelo SDK pode ser encontrado e navegado da issue até a ocorrência.

### 9. KAN-106 — Aplicação demo end-to-end

A pasta da demo pode nascer na KAN-101. Este ticket termina somente com o fluxo completo.

- [ ] Criar uma aplicação Express pequena.
- [ ] Adicionar rota saudável.
- [ ] Adicionar rota com exception controlada.
- [ ] Adicionar rota com latência simulada e segura.
- [ ] Instrumentar com SDK e middleware Express.
- [ ] Confirmar persistência e agrupamento.
- [ ] Confirmar exception no dashboard.
- [ ] Confirmar request nas métricas.
- [ ] Documentar passos exatos no README.
- [ ] Se possível, pedir que outra pessoa teste apenas pelo README.

**Concluído quando:** `Demo → SDK → Collector → PostgreSQL → API → Dashboard` puder ser reproduzido por outra pessoa.

### 10. KAN-107 — Deploy e operação

- [ ] Escolher os serviços de hospedagem.
- [ ] Publicar backend/collector, banco e frontend.
- [ ] Executar migrations de forma controlada.
- [ ] Separar variáveis e segredos por ambiente.
- [ ] Configurar CORS e URLs públicas.
- [ ] Criar health check e logs estruturados.
- [ ] Implementar graceful shutdown.
- [ ] Configurar CI com lint, typecheck, testes e build.
- [ ] Executar a demo contra o ambiente publicado.

**Concluído quando:** a demo funciona fora do ambiente local, o CI valida o projeto e nenhum segredo está versionado.

### 11. KAN-108 — Arquitetura e decisões técnicas

Atualize a documentação sempre que uma decisão for tomada.

- [ ] Criar README e quick start.
- [ ] Desenhar o diagrama de arquitetura.
- [ ] Documentar fluxo de ingestão, contrato e fingerprint.
- [ ] Registrar decisões e trade-offs em ADRs simples.
- [ ] Registrar limitações conhecidas.
- [ ] Separar o que existe do que é evolução futura.
- [ ] Revisar tudo usando uma instalação limpa.

**Concluído quando:** outro desenvolvedor entende o projeto, suas escolhas e como executar a demo.

### 12. KAN-109 — Benchmark e material de portfólio

Benchmark vem depois do produto funcional e publicado.

- [ ] Definir cenário de carga reproduzível.
- [ ] Registrar máquina, ambiente, banco, duração e volume.
- [ ] Medir throughput e latência.
- [ ] Observar o comportamento em falhas.
- [ ] Repetir o teste para reduzir resultados acidentais.
- [ ] Publicar metodologia junto dos resultados.
- [ ] Não apresentar resultado local como capacidade universal.
- [ ] Preparar screenshots/GIF e resumo técnico.

**Concluído quando:** os números são reproduzíveis, têm contexto e o material mostra o fluxo end-to-end real.

## Ordem resumida

1. Preparar monorepo, API e PostgreSQL local.
2. **KAN-98:** contrato e modelo de dados.
3. **KAN-99:** projetos e API keys.
4. **KAN-100:** ingestão de eventos.
5. Testar manualmente API → PostgreSQL.
6. **KAN-101:** SDK Node.js mínimo.
7. Criar a base da demo e testar `captureException()`.
8. **KAN-102:** integração automática com Express.
9. **KAN-103:** fingerprint e issues.
10. **KAN-104:** consultas e métricas.
11. **KAN-105:** dashboard React.
12. **KAN-106:** fechar a demo end-to-end.
13. **KAN-107:** deploy, operação e CI.
14. **KAN-108:** concluir a documentação mantida durante o projeto.
15. **KAN-109:** benchmark e portfólio.
16. Revisar todos os critérios de aceite da KAN-97.

## Marcos do projeto

1. **Banco preparado — KAN-98:** migrations rodam do zero e aceitam um evento mínimo.
2. **Collector vivo — KAN-99/100:** evento manual chega ao banco sem duplicação.
3. **SDK vivo — KAN-101:** `captureException()` envia sem derrubar a aplicação.
4. **Observabilidade útil — KAN-102/103:** Express é capturado e erros equivalentes viram uma issue.
5. **Produto visível — KAN-104/105:** issues, ocorrências e métricas aparecem no dashboard.
6. **Fluxo demonstrável — KAN-106/108:** outra pessoa reproduz a demo pelo README.
7. **Projeto público — KAN-107/109:** sistema publicado, validado no CI e benchmark documentado.

## Fluxo de trabalho no Jira

Para cada ticket:

1. Leia escopo e critérios de aceite.
2. Confirme se as dependências estão prontas.
3. Mova apenas o ticket atual para **Em andamento**.
4. Crie uma branch, por exemplo `codex/KAN-100-ingestao-eventos`.
5. Implemente somente o escopo do ticket.
6. Atualize a documentação relacionada.
7. Execute lint, typecheck, testes e build.
8. Abra o pull request com a chave do ticket.
9. Inclua evidências de cada critério de aceite.
10. Mova para **Em revisão**.
11. Após aprovação e validação, mova para **Concluído**.
12. Só então comece o próximo ticket dependente.

Modelo de pull request:

```text
Ticket: KAN-XXX

O que foi feito:
- ...

Como validar:
1. ...

Critérios de aceite:
- [x] ...

Riscos ou limitações:
- ...
```

## Pontos que ainda precisam de confirmação

- O dashboard terá login no MVP ou será de usuário único?
- Um projeto pertence a qual usuário ou organização?
- O SDK usará DSN, API key ou uma DSN que contém a chave?
- Quem gera o `eventId`: SDK, collector ou ambos?
- Qual é a política de retenção dos eventos?
- Qual é o tamanho máximo de evento e stack trace?
- O SDK será publicado no NPM durante a epic?
- Qual infraestrutura será usada no deploy?

Essas decisões devem ser documentadas, mas não podem aumentar silenciosamente o escopo de um ticket.

## Cuidados gerais de segurança

- nunca versionar segredos;
- não salvar API key em texto puro quando um hash for suficiente;
- não registrar credenciais em logs;
- mascarar headers, cookies, tokens e senhas;
- limitar o tamanho dos eventos;
- validar todo payload;
- garantir idempotência no banco;
- usar consultas paginadas;
- definir timeout no SDK;
- não deixar falha de telemetria derrubar a aplicação monitorada.

## O que não faz parte desta etapa

- tracing distribuído;
- OpenTelemetry;
- microsserviços;
- Kafka ou RabbitMQ;
- Redis;
- Elasticsearch;
- ClickHouse;
- Kubernetes;
- WebSocket;
- Grafana ou Prometheus;
- SDKs além do Node.js.

Essas tecnologias só devem ser avaliadas quando houver uma necessidade real.

## Checklist final da KAN-97

- [ ] KAN-98 a KAN-109 concluídas e validadas.
- [ ] Todos os critérios de aceite possuem evidência.
- [ ] O fluxo end-to-end funciona localmente.
- [ ] O fluxo end-to-end funciona no ambiente publicado.
- [ ] Nenhum segredo está versionado ou exposto.
- [ ] Outra pessoa consegue executar a demo pelo README.
- [ ] MVP e evoluções futuras estão claramente separados.

## Primeiro passo prático

Prepare o monorepo e depois execute a **KAN-98**. O primeiro resultado buscado deve ser:

```text
Contrato documentado
        +
Migration executando do zero
        +
Evento mínimo salvo no PostgreSQL
```

Somente depois avance para API keys e ingestão. Isso evita construir API, SDK e dashboard sobre um formato de evento indefinido.
