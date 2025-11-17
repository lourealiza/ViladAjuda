#!/bin/bash

# Script de Setup Completo para Servidor
# Execute: bash scripts/setup-servidor.sh

set -e  # Parar em caso de erro

echo "==============================================="
echo "SETUP COMPLETO - Vila d'Ajuda Backend"
echo "==============================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Verificar Node.js
echo "1. Verificando Node.js..."
if ! command_exists node; then
    echo -e "${YELLOW}Node.js não encontrado. Instalando...${NC}"
    
    # Tentar instalar via NVM
    if [ ! -d "$HOME/.nvm" ]; then
        echo "Instalando NVM..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    else
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi
    
    echo "Instalando Node.js LTS..."
    nvm install --lts
    nvm use --lts
    nvm alias default node
else
    echo -e "${GREEN}✓ Node.js já instalado: $(node --version)${NC}"
fi

# 2. Verificar npm
echo ""
echo "2. Verificando npm..."
if ! command_exists npm; then
    echo -e "${RED}Erro: npm não encontrado mesmo após instalar Node.js${NC}"
    exit 1
else
    echo -e "${GREEN}✓ npm encontrado: $(npm --version)${NC}"
fi

# 3. Navegar para diretório do backend
echo ""
echo "3. Navegando para diretório do backend..."

# Tentar diferentes caminhos possíveis
if [ -d "$HOME/viladajuda/backend" ]; then
    BACKEND_DIR="$HOME/viladajuda/backend"
elif [ -d "$HOME/backend" ]; then
    BACKEND_DIR="$HOME/backend"
elif [ -d "/home/viladajuda/viladajuda/backend" ]; then
    BACKEND_DIR="/home/viladajuda/viladajuda/backend"
else
    # Tentar encontrar pelo script atual
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
fi

cd "$BACKEND_DIR"
echo "Diretório atual: $(pwd)"

# 4. Verificar se package.json existe
if [ ! -f "package.json" ]; then
    echo -e "${RED}Erro: package.json não encontrado em $(pwd)${NC}"
    exit 1
fi

# 5. Instalar dependências
echo ""
echo "4. Instalando dependências npm..."
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓ Dependências instaladas${NC}"
else
    echo -e "${YELLOW}node_modules já existe. Pulando instalação...${NC}"
    echo "Execute 'npm install' manualmente se necessário."
fi

# 6. Verificar arquivo .env
echo ""
echo "5. Verificando arquivo .env..."
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Arquivo .env não encontrado.${NC}"
    echo "Criando arquivo .env de exemplo..."
    cat > .env << EOF
PORT=3000
NODE_ENV=production
DB_TYPE=mysql
DB_HOST=localhost
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_NAME=viladajuda
JWT_SECRET=GERE_UMA_CHAVE_SECRETA_ALEATORIA_AQUI
JWT_EXPIRE=7d
FRONTEND_URL=https://www.viladajuda.com.br
BACKUP_DIR=./backups
EOF
    echo -e "${YELLOW}⚠️  IMPORTANTE: Edite o arquivo .env com suas configurações!${NC}"
    echo "Execute: nano .env"
    read -p "Pressione Enter após configurar o .env..."
else
    echo -e "${GREEN}✓ Arquivo .env encontrado${NC}"
fi

# 7. Inicializar banco de dados
echo ""
echo "6. Inicializando banco de dados..."
npm run init-db
echo -e "${GREEN}✓ Banco de dados inicializado${NC}"

# 8. Inserir avaliações
echo ""
echo "7. Inserindo avaliações de exemplo..."
npm run inserir-avaliacoes
echo -e "${GREEN}✓ Avaliações inseridas${NC}"

# 9. Verificar PM2
echo ""
echo "8. Verificando PM2..."
if ! command_exists pm2; then
    echo -e "${YELLOW}PM2 não encontrado. Instalando...${NC}"
    npm install -g pm2
    echo -e "${GREEN}✓ PM2 instalado${NC}"
else
    echo -e "${GREEN}✓ PM2 já instalado${NC}"
fi

# 10. Iniciar servidor com PM2
echo ""
echo "9. Iniciando servidor com PM2..."
if pm2 list | grep -q "viladajuda-api"; then
    echo -e "${YELLOW}Servidor já está rodando. Reiniciando...${NC}"
    pm2 restart viladajuda-api
else
    pm2 start src/server.js --name viladajuda-api
    pm2 save
    echo -e "${GREEN}✓ Servidor iniciado${NC}"
fi

# 11. Configurar startup automático
echo ""
echo "10. Configurando startup automático..."
pm2 startup
echo -e "${YELLOW}⚠️  Execute o comando mostrado acima para configurar startup automático${NC}"

# 12. Verificar status
echo ""
echo "11. Verificando status do servidor..."
pm2 status

echo ""
echo "==============================================="
echo -e "${GREEN}✓ SETUP COMPLETO!${NC}"
echo "==============================================="
echo ""
echo "Próximos passos:"
echo "1. Verificar logs: pm2 logs viladajuda-api"
echo "2. Testar API: curl http://localhost:3000/api"
echo "3. Alterar senha do admin: admin@viladajuda.com / admin123"
echo ""
echo "Para monitorar: pm2 monit"
echo "Para reiniciar: pm2 restart viladajuda-api"
echo "Para parar: pm2 stop viladajuda-api"
echo ""

