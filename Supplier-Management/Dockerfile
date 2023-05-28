FROM node:14.17.0-alpine3.13
WORKDIR /Supplier-Management
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3002
CMD ["node", "app.js"]