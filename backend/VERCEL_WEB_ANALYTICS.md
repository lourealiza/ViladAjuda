# Integração Vercel Web Analytics

Este documento descreve como o Vercel Web Analytics foi integrado ao backend da Vila d'Ajuda.

## O que é Vercel Web Analytics?

Vercel Web Analytics é um serviço de análise integrado fornecido pela Vercel que rastreia métricas de desempenho e eventos personalizados em aplicações implantadas na plataforma.

## Implementação no Backend

### 1. Instalação do Pacote

O pacote `@vercel/analytics` foi adicionado às dependências:

```bash
npm install @vercel/analytics
```

### 2. Middleware de Análise

Foi criado um middleware server-side em `src/middleware/analytics.js` que:

- Rastreia todas as requisições de API
- Registra o método HTTP, caminho, código de status
- Mede o tempo de resposta (duration)
- Captura IDs de usuário quando disponível
- Rastreia erros (status 400+)

### 3. Integração no Servidor

O middleware foi integrado ao Express em `src/server.js`:

```javascript
// Middleware de análise do Vercel Web Analytics
app.use('/api', analyticsMiddleware);
```

## Como Funciona

Cada requisição à API agora é rastreada com as seguintes informações:

- **method**: Método HTTP (GET, POST, PUT, DELETE, etc.)
- **path**: Caminho da rota requisitada
- **statusCode**: Código de resposta HTTP
- **duration**: Tempo em milissegundos para processar a requisição
- **userId**: ID do usuário (se autenticado)
- **clientIp**: Endereço IP do cliente

## Tipos de Eventos Rastreados

1. **api_request**: Requisições gerais de API
2. **api_response**: Respostas bem-sucedidas
3. **api_error**: Erros na API (status >= 400)

## Visualização dos Dados

Os dados coletados podem ser visualizados no:

1. **Dashboard do Vercel**: Seção Analytics
2. **Filtros Disponíveis**: 
   - Por método HTTP
   - Por rota
   - Por código de status
   - Por tempo de resposta

## Configuração no Vercel

Certifique-se de que o Web Analytics está habilitado no projeto Vercel:

1. Acesse o [Dashboard do Vercel](https://vercel.com/dashboard)
2. Selecione o projeto
3. Clique na aba **Analytics**
4. Clique em **Enable** se não estiver ativado

## Requisitos para Eventos Personalizados

Para usar eventos personalizados avançados com dados customizados, você precisa estar em um plano **Pro ou Enterprise**.

## Tratamento de Erros

O middleware não interrompe o fluxo da aplicação se o rastreamento falhar. Os erros de rastreamento são registrados no console sem afetar as requisições.

## Próximas Etapas

1. Deploy para Vercel
2. Enviar tráfego para a API
3. Visualizar dados no dashboard de Analytics do Vercel
4. (Opcional) Adicionar eventos personalizados para rastreamento específico de negócio
