#!/bin/bash
# Script rápido de deploy - Execute no servidor após enviar os arquivos

set -e

echo "🚀 Deploy Rápido - Vila d'Ajuda"
echo ""

# Variáveis
BACKEND_DIR="$HOME/viladajuda/backend"
PUBLIC_DIR="$HOME/public_html"

# Verificar se os diretórios existem
if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Diretório backend não encontrado: $BACKEND_DIR"
    echo "Envie os arquivos primeiro!"
    exit 1
fi

# Navegar para o backend
cd "$BACKEND_DIR"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install --production

# Verificar .env
if [ ! -f ".env" ]; then
    echo "⚠ Arquivo .env não encontrado. Criando..."
    cat > .env << 'EOF'
# Configurações do Servidor
PORT=3000
NODE_ENV=production

# Configurações do Banco de Dados
DB_TYPE=mysql
DB_HOST=mysql66-farm2.uni5.net
DB_USER=viladajuda
DB_PASSWORD=arraial2026
DB_NAME=viladajuda
DB_PORT=3306

# Configurações JWT
JWT_SECRET=viladajuda_production_secret_2026_muito_seguro_mude_isso
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=https://www.viladajuda.com.br
EOF
    echo "✓ Arquivo .env criado"
fi

# Testar MySQL
echo ""
echo "🔍 Testando conexão MySQL..."
npm run test-mysql

# Inicializar banco
echo ""
echo "🗄️ Inicializando banco de dados..."
npm run init-mysql

# Instalar PM2 se necessário
if ! command -v pm2 &> /dev/null; then
    echo ""
    echo "📦 Instalando PM2..."
    npm install -g pm2
fi

# Parar processo anterior
echo ""
echo "🛑 Parando processos anteriores..."
pm2 stop viladajuda-api 2>/dev/null || true
pm2 delete viladajuda-api 2>/dev/null || true

# Iniciar backend
echo ""
echo "🚀 Iniciando backend..."
pm2 start src/server.js --name viladajuda-api
pm2 save

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📊 Status:"
pm2 status
echo ""
echo "📝 Logs: pm2 logs viladajuda-api"
echo "🔄 Reiniciar: pm2 restart viladajuda-api"
echo ""

