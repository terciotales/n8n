# Imagem oficial do Playwright já vem com Chromium, Firefox, WebKit e dependências gráficas
FROM mcr.microsoft.com/playwright:v1.55.0-jammy

# Diretório de trabalho
WORKDIR /app

# Copia e instala dependências
COPY package*.json ./
RUN npm install

# Copia código da aplicação
COPY . .

# Porta da API
EXPOSE 3000

# Inicia o serviço em modo desenvolvimento com nodemon
CMD ["npm", "run", "dev"]
