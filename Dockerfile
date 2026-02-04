FROM node:22.20.0-alpine3.22

RUN apk add nginx

COPY nginx.conf ./etc/nginx/nginx.conf

RUN nginx -t

WORKDIR /app

COPY turbo.json .
COPY package.json .
COPY package-lock.json .
COPY docker-entrypoint.sh .
COPY packages/backend ./packages/backend    
COPY packages/frontend ./packages/frontend  

RUN npm ci

ARG REACT_APP_BACKEND_URL=http://localhost:8080

RUN npm run build

RUN chmod +x docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]
EXPOSE 8080


