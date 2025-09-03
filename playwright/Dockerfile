# Imagem oficial do Playwright já vem com Chromium, Firefox, WebKit e dependências gráficas
FROM mcr.microsoft.com/playwright:focal

# Diretório de trabalho
WORKDIR /app

# Copia e instala dependências
COPY package*.json ./
RUN npm install --production

# Copia código da aplicação
COPY . .

# Porta da API
EXPOSE 3000

# Inicia o serviço
CMD ["node", "index.js"]
