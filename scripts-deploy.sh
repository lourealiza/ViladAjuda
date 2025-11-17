#!/bin/bash

# Script de Deploy Automático - Vila d'Ajuda
# Execute no servidor após enviar os arquivos

set -e  # Parar em caso de erro

echo "🚀 Iniciando deploy da Vila d'Ajuda..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variáveis
PROJECT_DIR="$HOME/viladajuda"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
PUBLIC_DIR="$HOME/public_html"

# Criar diretórios se não existirem
echo "📁 Criando diretórios..."
mkdir -p "$BACKEND_DIR"
mkdir -p "$FRONTEND_DIR"
mkdir -p "$PUBLIC_DIR"
echo -e "${GREEN}✓ Diretórios criados${NC}"
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado!${NC}"
    echo "Instale Node.js primeiro:"
    echo "  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "  sudo apt-get install -y nodejs"
    exit 1
fi

echo -e "${GREEN}✓ Node.js encontrado: $(node --version)${NC}"
echo ""

# Instalar dependências do backend
if [ -d "$BACKEND_DIR" ] && [ -f "$BACKEND_DIR/package.json" ]; then
    echo "📦 Instalando dependências do backend..."
    cd "$BACKEND_DIR"
    npm install --production
    echo -e "${GREEN}✓ Dependências instaladas${NC}"
    echo ""
else
    echo -e "${YELLOW}⚠ Pasta backend não encontrada. Pule esta etapa se já instalou manualmente.${NC}"
    echo ""
fi

# Verificar arquivo .env
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo -e "${YELLOW}⚠ Arquivo .env não encontrado!${NC}"
    echo "Criando arquivo .env de exemplo..."
    cat > "$BACKEND_DIR/.env" << EOF
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
FRONTEND_URL=http://viladajuda.web213.uni5.net
EOF
    echo -e "${GREEN}✓ Arquivo .env criado${NC}"
    echo -e "${YELLOW}⚠ IMPORTANTE: Revise e ajuste o arquivo .env antes de continuar!${NC}"
    echo ""
fi

# Testar conexão MySQL
if [ -d "$BACKEND_DIR" ]; then
    echo "🔍 Testando conexão MySQL..."
    cd "$BACKEND_DIR"
    if npm run test-mysql 2>/dev/null; then
        echo -e "${GREEN}✓ Conexão MySQL OK${NC}"
    else
        echo -e "${YELLOW}⚠ Erro ao testar MySQL. Verifique as credenciais no .env${NC}"
    fi
    echo ""
fi

# Inicializar banco de dados
echo "🗄️ Inicializando banco de dados..."
cd "$BACKEND_DIR"
if npm run init-mysql 2>/dev/null; then
    echo -e "${GREEN}✓ Banco de dados inicializado${NC}"
else
    echo -e "${YELLOW}⚠ Erro ao inicializar banco. Execute manualmente: npm run init-mysql${NC}"
fi
echo ""

# Instalar PM2 se não estiver instalado
if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2..."
    npm install -g pm2
    echo -e "${GREEN}✓ PM2 instalado${NC}"
    echo ""
fi

# Parar processo anterior se existir
echo "🛑 Parando processos anteriores..."
pm2 stop viladajuda-api 2>/dev/null || true
pm2 delete viladajuda-api 2>/dev/null || true
echo -e "${GREEN}✓ Processos anteriores parados${NC}"
echo ""

# Iniciar backend com PM2
echo "🚀 Iniciando backend..."
cd "$BACKEND_DIR"
pm2 start src/server.js --name viladajuda-api
pm2 save
echo -e "${GREEN}✓ Backend iniciado${NC}"
echo ""

# Copiar frontend para public_html
if [ -d "$FRONTEND_DIR" ]; then
    echo "📁 Copiando frontend para public_html..."
    cp -r "$FRONTEND_DIR"/* "$PUBLIC_DIR"/ 2>/dev/null || true
    echo -e "${GREEN}✓ Frontend copiado${NC}"
    echo ""
fi

# Mostrar status
echo "📊 Status do sistema:"
echo ""
pm2 status
echo ""
echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo ""
echo "🔗 URLs:"
echo "  Frontend: http://viladajuda.web213.uni5.net/"
echo "  Backend:  http://viladajuda.web213.uni5.net:3000/api"
echo ""
echo "📝 Comandos úteis:"
echo "  pm2 logs viladajuda-api          # Ver logs"
echo "  pm2 restart viladajuda-api        # Reiniciar"
echo "  pm2 stop viladajuda-api           # Parar"
echo "  pm2 monit                         # Monitorar recursos"
echo ""

