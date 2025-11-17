#!/bin/bash

# Script para instalar Node.js via NVM
# Execute: bash scripts/instalar-node.sh

set -e

echo "==============================================="
echo "INSTALANDO NODE.JS VIA NVM"
echo "==============================================="
echo ""

# Instalar NVM se não existir
if [ ! -d "$HOME/.nvm" ]; then
    echo "1. Instalando NVM..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    
    # Carregar NVM
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    echo "✓ NVM instalado"
else
    echo "✓ NVM já instalado"
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# Instalar Node.js LTS
echo ""
echo "2. Instalando Node.js LTS..."
nvm install --lts

# Usar versão instalada
nvm use --lts

# Definir como padrão
nvm alias default node

# Verificar instalação
echo ""
echo "3. Verificando instalação..."
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"

# Adicionar ao .bashrc se não estiver
if ! grep -q "NVM_DIR" ~/.bashrc; then
    echo ""
    echo "4. Adicionando NVM ao .bashrc..."
    cat >> ~/.bashrc << 'EOF'

# NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
EOF
    echo "✓ NVM adicionado ao .bashrc"
    echo "⚠️  Execute 'source ~/.bashrc' ou feche e abra o terminal novamente"
fi

echo ""
echo "==============================================="
echo "✓ INSTALAÇÃO CONCLUÍDA!"
echo "==============================================="
echo ""
echo "Próximos passos:"
echo "1. Recarregar shell: source ~/.bashrc"
echo "2. Navegar para backend: cd ~/viladajuda/backend"
echo "3. Instalar dependências: npm install"
echo "4. Executar setup: npm run setup-completo"
echo ""

