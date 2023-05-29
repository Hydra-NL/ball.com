FROM node:14.17.0-alpine3.13
WORKDIR /Delivery-Management
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3003
CMD ["node", "index.js"]