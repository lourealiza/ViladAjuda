// teste-cors.js - Script para testar CORS backend/frontend
// Execute no console do navegador em https://viladajuda.vercel.app

console.log('🧪 Testando CORS - Vila d\'Ajuda API\n');

const API_URL = 'https://backend-mjzdnzhdb-lourealizas-projects.vercel.app/api';

async function testarCORS() {
    try {
        console.log('📡 Testando conexão com:', API_URL);
        
        const response = await fetch(`${API_URL}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        console.log('✅ Status:', response.status);
        console.log('✅ Headers CORS:');
        console.log('  - Access-Control-Allow-Origin:', response.headers.get('access-control-allow-origin'));
        console.log('  - Access-Control-Allow-Credentials:', response.headers.get('access-control-allow-credentials'));
        
        const data = await response.json();
        console.log('\n✅ Resposta JSON:');
        console.log(data);
        
        if (response.ok) {
            console.log('\n🎉 CORS está FUNCIONANDO! ✨');
            console.log('Frontend pode conectar ao backend sem problemas.');
        }
        
    } catch (error) {
        console.error('❌ Erro CORS:', error.message);
        console.error('Detalhes:', error);
        
        if (error.message.includes('Failed to fetch')) {
            console.log('\n💡 Sugestões:');
            console.log('1. Verificar se backend está online');
            console.log('2. Verificar console do backend para logs CORS');
            console.log('3. Tentar: vercel logs --production no backend');
        }
    }
}

// Executar teste
testarCORS();

// Salvar para referência
console.log('\n📝 Para testar novamente, execute: testarCORS()');
console.log('📚 Documentação: VERCEL_DOMAINS_SETUP.md');
