# 🚀 Guia de Deploy EstudaAI

## Passo 1: Criar Repositório no GitHub

### Opção A: Usando GitHub CLI (Recomendado)

```bash
# Se tiver GitHub CLI instalado
gh repo create estudaai --public --source=. --remote=origin --push
```

### Opção B: Manualmente no GitHub

1. Vá para https://github.com/new
2. Crie repositório com nome: `estudaai`
3. Marque "Public"
4. NÃO inicialize com README (já temos)
5. Copie o link SSH/HTTPS que aparecer

Depois execute:

```bash
git remote add origin https://github.com/SEU_USUARIO/estudaai.git
git branch -M main
git push -u origin main
```

---

## Passo 2: Deploy no Vercel

### Opção A: Usando Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Opção B: Pelo Dashboard Vercel

1. Vá para https://vercel.com/new
2. Clique "Import Git Repository"
3. Cole seu link do GitHub
4. Selecione "Next.js/Vite"
5. Em "Environment Variables", adicione:
   - `VITE_SUPABASE_URL`: (já vem pronto)
   - `VITE_SUPABASE_KEY`: (já vem pronto)
6. Clique "Deploy"

---

## Passo 3: Testar em Produção

Após deploy, acesse sua URL do Vercel (ex: `https://estudaai.vercel.app`)

**Credenciais:**
- Coach: `carlos@estudaai.com` / `coach123`
- Aluno: `ana@estudaai.com` / `aluno123`

---

## Troubleshooting

### Build falha com erro de módulos
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Porta já em uso
```bash
npm run dev -- --port 3000
```

---

✅ Pronto para deploy!
