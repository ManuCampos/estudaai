# EstudaAI 📚

Sistema de Gestão de Estudos com revisões espaçadas.

## Perfis

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Admin  | admin@estudaai.com  | admin123  |
| Coach  | carlos@estudaai.com | coach123  |
| Aluno  | ana@estudaai.com    | aluno123  |

## Funcionalidades

- **Admin** — gerencia coaches, alunos, logs e resets de senha
- **Coach** — cria editais, matérias, tópicos e acompanha progresso dos alunos
- **Aluno** — gera plano de estudos, configura rotina e acompanha progresso

## Tecnologias

- React 18 + Vite 5
- Revisões espaçadas automáticas (1, 3, 7, 14, 30 dias)
- Arquitetura modular: auth / users / editais / planos / progresso

## Deploy

Hospedado no Vercel — push na branch `main` faz deploy automático.

## Desenvolvimento local

```bash
npm install
npm run dev
```

Abra http://localhost:5173
