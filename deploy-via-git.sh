#!/bin/bash
# Script de Deploy via Git - Execute no servidor SSH
# Não precisa de scp, usa Git para baixar o código

set -e

echo "🚀 Deploy Vila d'Ajuda via Git"
echo ""

# Variáveis
BACKEND_DIR="$HOME/viladajuda/backend"
PUBLIC_DIR="$HOME/public_html"
REPO_URL="https://github.com/lourealiza/ViladAjuda.git"
TEMP_DIR="$HOME/temp-vila-deploy"

# Criar diretórios
echo "📁 Criando diretórios..."
mkdir -p "$BACKEND_DIR"
mkdir -p "$PUBLIC_DIR"
echo "✓ Diretórios criados"
echo ""

# Clonar repositório
echo "📥 Clonando repositório do GitHub..."
if [ -d "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
fi
git clone "$REPO_URL" "$TEMP_DIR"
echo "✓ Repositório clonado"
echo ""

# Copiar backend
echo "📦 Copiando arquivos do backend..."
cp -r "$TEMP_DIR/backend"/* "$BACKEND_DIR"/
echo "✓ Backend copiado"
echo ""

# Copiar frontend
echo "🌐 Copiando arquivos do frontend..."
cp -r "$TEMP_DIR/deploy_kinghost"/* "$PUBLIC_DIR"/
echo "✓ Frontend copiado"
echo ""

# Limpar arquivo temporário
echo "🧹 Limpando arquivos temporários..."
rm -rf "$TEMP_DIR"
echo "✓ Limpeza concluída"
echo ""

# Navegar para o backend
cd "$BACKEND_DIR"

# Instalar dependências
echo "📦 Instalando dependências do backend..."
npm install --production
echo "✓ Dependências instaladas"
echo ""

# Criar arquivo .env
if [ ! -f ".env" ]; then
    echo "📝 Criando arquivo .env..."
    cat > .env << 'EOF'
PORT=3000
NODE_ENV=production
DB_TYPE=mysql
DB_HOST=mysql66-farm2.uni5.net
DB_USER=viladajuda
DB_PASSWORD=arraial2026
DB_NAME=viladajuda
DB_PORT=3306
JWT_SECRET=viladajuda_production_secret_2026_muito_seguro_mude_isso
JWT_EXPIRE=7d
FRONTEND_URL=https://www.viladajuda.com.br
EOF
    echo "✓ Arquivo .env criado"
    echo ""
fi

# Testar MySQL
echo "🔍 Testando conexão MySQL..."
npm run test-mysql
echo ""

# Inicializar banco
echo "🗄️ Inicializando banco de dados..."
npm run init-mysql
echo ""

# Instalar PM2 se necessário
if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2..."
    npm install -g pm2
    echo "✓ PM2 instalado"
    echo ""
fi

# Parar processo anterior
echo "🛑 Parando processos anteriores..."
pm2 stop viladajuda-api 2>/dev/null || true
pm2 delete viladajuda-api 2>/dev/null || true

# Iniciar backend
echo "🚀 Iniciando backend..."
pm2 start src/server.js --name viladajuda-api
pm2 save
echo "✓ Backend iniciado"
echo ""

echo "✅ Deploy concluído!"
echo ""
echo "📊 Status:"
pm2 status
echo ""
echo "📝 Próximos passos:"
echo "  1. Configurar proxy reverso (Nginx/Apache)"
echo "  2. Testar: https://www.viladajuda.com.br"
echo "  3. Ver logs: pm2 logs viladajuda-api"
echo ""

