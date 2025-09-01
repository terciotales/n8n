#!/bin/bash

echo "🚀 Iniciando setup do projeto n8n + Docker..."

# 0. Parar e remover container existente
echo "🛑 Verificando containers antigos..."
docker-compose down --remove-orphans

# 1. Remover pasta playwright antiga (se existir)
if [ -d "playwright" ]; then
  rm -rf playwright
  echo "🗑️  Pasta 'playwright' removida (não mais necessária)."
fi

# 2. Criar pasta de dados
if [ ! -d "data" ]; then
  mkdir data
  echo "📂 Pasta 'data' criada."
else
  echo "📂 Pasta 'data' já existe, pulando..."
fi

# 3. Criar arquivo .env
if [ ! -f ".env" ]; then
  cat <<EOL > .env
# Configuração do n8n
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=admin123
N8N_HOST=localhost
N8N_PORT=5678
EOL
  echo "📝 Arquivo .env criado."
else
  echo "📝 Arquivo .env já existe, pulando..."
fi

# 4. Subir containers
echo "🐳 Subindo container do n8n..."
docker-compose up -d --build

echo "✅ Setup concluído! Acesse: http://localhost:5678"
echo "ℹ️  O Playwright agora será usado diretamente dentro do n8n quando necessário."
