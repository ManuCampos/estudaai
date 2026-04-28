#!/bin/bash

echo "🚀 EstudaAI - Deployment Script"
echo "================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Pedir informações do usuário
echo -e "${BLUE}📝 Configuração do GitHub${NC}"
read -p "Seu usuário GitHub: " GITHUB_USER
read -p "Seu email GitHub: " GITHUB_EMAIL
read -s -p "Seu token GitHub (gerar em https://github.com/settings/tokens): " GITHUB_TOKEN
echo ""

# Configurar Git
git config user.email "$GITHUB_EMAIL"
git config user.name "$GITHUB_USER"

# Criar repositório
echo -e "${BLUE}📦 Criando repositório no GitHub...${NC}"
REPO_NAME="estudaai"
API_URL="https://api.github.com/user/repos"

curl -u "$GITHUB_USER:$GITHUB_TOKEN" \
  -X POST "$API_URL" \
  -H "Accept: application/vnd.github.v3+json" \
  -d "{\"name\":\"$REPO_NAME\",\"description\":\"Sistema de Gestão de Estudos\",\"private\":false}" \
  2>/dev/null

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Repositório criado com sucesso!${NC}"
else
  echo -e "${RED}⚠️  Pode ser que o repositório já exista${NC}"
fi

# Fazer push
echo -e "${BLUE}📤 Fazendo push para GitHub...${NC}"
git remote add origin "https://$GITHUB_USER:$GITHUB_TOKEN@github.com/$GITHUB_USER/estudaai.git" 2>/dev/null || \
git remote set-url origin "https://$GITHUB_USER:$GITHUB_TOKEN@github.com/$GITHUB_USER/estudaai.git"

git branch -M main 2>/dev/null || true
git push -u origin main

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Push realizado com sucesso!${NC}"
  echo -e "${BLUE}📍 Repositório: https://github.com/$GITHUB_USER/estudaai${NC}"
else
  echo -e "${RED}❌ Erro ao fazer push${NC}"
  exit 1
fi

# Deploy Vercel
echo ""
echo -e "${BLUE}🌐 Próximo passo: Deploy no Vercel${NC}"
echo -e "${GREEN}1. Vá para https://vercel.com/new${NC}"
echo -e "${GREEN}2. Clique em 'Import Git Repository'${NC}"
echo -e "${GREEN}3. Selecione: https://github.com/$GITHUB_USER/estudaai${NC}"
echo -e "${GREEN}4. Clique em 'Deploy'${NC}"
echo ""
echo -e "${BLUE}✨ Aplicação estará disponível em https://estudaai.vercel.app${NC}"

