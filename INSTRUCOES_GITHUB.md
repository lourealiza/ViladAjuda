# Instruções para Criar o Repositório no GitHub

## Passo a Passo

1. **Criar o repositório no GitHub:**
   - Acesse https://github.com/new
   - Nome do repositório: `ViladAjuda`
   - Descrição: "Site de chalés em Arraial d'Ajuda - Bahia"
   - Escolha **Público** ou **Privado** conforme preferir
   - **NÃO** marque "Initialize this repository with a README" (já temos um)
   - Clique em "Create repository"

2. **Conectar o repositório local ao GitHub:**
   Execute os seguintes comandos no terminal (substitua `SEU_USUARIO` pelo seu usuário do GitHub):

   ```bash
   git remote add origin https://github.com/SEU_USUARIO/ViladAjuda.git
   git branch -M main
   git push -u origin main
   ```

3. **Ativar GitHub Pages:**
   - No repositório do GitHub, vá em **Settings** (Configurações)
   - No menu lateral, clique em **Pages**
   - Em "Source", selecione a branch **main**
   - Clique em **Save**
   - Aguarde alguns minutos e seu site estará disponível em:
     `https://SEU_USUARIO.github.io/ViladAjuda/`

## Próximos Passos

- Adicione imagens reais dos chalés na pasta `images/` e atualize as referências no HTML
- Configure o formulário de reserva para enviar emails ou integrar com um sistema de reservas
- Adicione um mapa interativo do Google Maps na seção de localização
- Personalize as cores e estilos conforme necessário

