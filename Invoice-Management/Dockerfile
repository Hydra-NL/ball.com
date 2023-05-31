FROM node:14.17.0-alpine3.13
WORKDIR /Invoice-Management
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3005
CMD ["node", "app.js"]