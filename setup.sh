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

# 5. Instalar dependências do Chromium e Playwright dentro do container n8n

echo "🔧 Instalando dependências do Chromium no container n8n..."
docker exec n8n sh -c "apt-get update && apt-get install -y \
    libglib2.0-0 libnss3 libgconf-2-4 libatk-bridge2.0-0 libatk1.0-0 \
    libcups2 libdbus-1-3 libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 \
    libgbm1 libasound2 libpangocairo-1.0-0 libpango-1.0-0 libx11-6 \
    libxext6 libxfixes3 libxkbcommon0 libatspi2.0-0 libnspr4 \
    libnssutil3 libsmime3 libgio-2.0-0 libudev1 libcairo2"

echo "📦 Instalando Playwright localmente em /home/node/.n8n/nodes..."
docker exec n8n sh -c "mkdir -p /home/node/.n8n/nodes && cd /home/node/.n8n/nodes && npm install playwright && npx playwright install chromium"

echo "✅ Playwright e Chromium instalados no container n8n!"
echo "✅ Setup concluído! Acesse: http://localhost:5678"
echo "ℹ️  O Playwright agora será usado diretamente dentro do n8n quando necessário."
