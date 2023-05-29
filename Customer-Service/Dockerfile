FROM node:14.17.0-alpine3.13
WORKDIR /Customer-Service
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3004
CMD ["node", "app.js"]