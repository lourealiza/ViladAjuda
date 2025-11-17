#!/bin/bash

echo "🧪 Testando API Vila d'Ajuda"
echo "================================"
echo ""

echo "1️⃣  Testando endpoint raiz (/api)..."
echo "-----------------------------------"
curl -s http://localhost:3000/api
echo ""
echo ""

echo "2️⃣  Testando listagem de chalés (/api/chales)..."
echo "-----------------------------------"
curl -s http://localhost:3000/api/chales | head -30
echo ""
echo ""

echo "3️⃣  Testando busca de chalé específico (/api/chales/1)..."
echo "-----------------------------------"
curl -s http://localhost:3000/api/chales/1
echo ""
echo ""

echo "4️⃣  Testando disponibilidade..."
echo "-----------------------------------"
curl -s "http://localhost:3000/api/chales/1/disponibilidade?data_checkin=2024-12-20&data_checkout=2024-12-25"
echo ""
echo ""

echo "✅ Testes concluídos!"
echo ""
echo "💡 Se todas as respostas retornaram JSON, a API está funcionando!"

