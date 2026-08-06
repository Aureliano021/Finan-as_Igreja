# Estágio 1: Build da aplicação React/Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Copia lista de dependências e instala
COPY package*.json ./
RUN npm ci

# Copia o código fonte e gera o build de produção
COPY . .
RUN npm run build

# Estágio 2: Servidor Web de Produção leve (Nginx Alpine)
FROM nginx:alpine

# Copia a configuração do Nginx para suporte a Single Page Application (React)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia a pasta dist gerada no estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
