# 🚀 Setup Final - Domínios Vercel

## Projetos Criados

### Backend API
- **Projeto**: lourealizas-projects/backend
- **URL**: https://backend-mjzdnzhdb-lourealizas-projects.vercel.app/api/
- **Status**: ✅ Operacional
- **Código**: `/backend`

### Frontend (Novo)
- **Projeto**: lourealizas-projects/viladajuda-frontend
- **URL**: https://viladajuda-frontend-l4g1ew8of-lourealizas-projects.vercel.app/
- **Status**: ✅ Operacional
- **Código**: `./`

---

## ⚙️ Próximas Etapas no Vercel Dashboard

### Para que `https://viladajuda.vercel.app/` aponte para o Frontend:

1. **Acesse**: https://vercel.com/lourealizas-projects/viladajuda-frontend/settings/domains

2. **Clique** em "Add Domain"

3. **Digite**: `viladajuda.vercel.app` e clique em "Add"

4. **Confirme** na página de confirmação

---

## Ou via CLI (Alternativa):

```bash
cd c:\Users\loura\OneDrive\08_Arquivo\Trabalho_Antigo\Documentos\Vila\ d\'Ajuda\ViladAjuda

# Adicionar domínio ao projeto frontend
vercel domains add viladajuda.vercel.app --project viladajuda-frontend

# Verificar
vercel domains list
```

---

## Status Atual

| URL | Projeto | Status |
|-----|---------|--------|
| https://backend-mjzdnzhdb-lourealizas-projects.vercel.app/ | backend | ✅ |
| https://viladajuda-frontend-l4g1ew8of-lourealizas-projects.vercel.app/ | viladajuda-frontend | ✅ |
| https://viladajuda.vercel.app/ | ??? → backend (precisa apontar para frontend) | ⏳ |
| https://www.viladajuda.com.br | frontend | ⏳ (verificar DNS) |

---

## 📋 Checklist Final

- [x] Backend deployado e funcionando
- [x] Frontend deployado e funcionando
- [ ] Domínio viladajuda.vercel.app → frontend
- [ ] Domínio www.viladajuda.com.br → frontend (DNS settings)
- [ ] Socket.io integrado no admin
- [ ] Testes E2E completos

---

**Nota**: Após adicionar o domínio no Vercel, deve levar 1-5 minutos para propagar. Após isso, https://viladajuda.vercel.app/ será o frontend HTML.
