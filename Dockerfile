# Estágio de build
FROM node:22-alpine AS builder

# Definir o diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json (se existir)
COPY package*.json ./

# Instalar dependências do sistema necessárias para o Angular CLI
RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  && rm -rf /var/cache/apk/*

# Instalar dependências do projeto
RUN npm install

# Instalar Angular CLI globalmente
RUN npm install -g @angular/cli@19

# Verificar se npm e ng estão disponíveis
RUN npm --version && ng version

# Copiar o restante do código
COPY . .

# Listar arquivos no diretório environments para depuração
RUN ls -la src/environment

# Executar o build do Angular
RUN npm run build

# Estágio final: servir os arquivos estáticos
FROM node:22-alpine

# Instalar o pacote serve globalmente
RUN npm install -g serve@14.2.3

# Copiar os arquivos de build do estágio anterior
COPY --from=builder /app/dist/browser /app/dist/browser

# Definir o diretório de trabalho
WORKDIR /app

# Definir uma porta padrão caso $PORT não esteja definido
ENV PORT=3000

# Expor a porta
EXPOSE 3000

# Comando para iniciar o servidor
CMD serve -s dist/browser -l ${PORT}





