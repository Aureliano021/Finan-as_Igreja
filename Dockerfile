# Servidor Web de Produção leve (Nginx Alpine)
FROM nginx:alpine

# Copia a configuração do Nginx para suporte a Single Page Application (React)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia a pasta dist compilada
COPY dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
