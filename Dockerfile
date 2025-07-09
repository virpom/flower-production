FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .
COPY .env .
RUN npx tsc models/User.ts --outDir dist --module commonjs --esModuleInterop

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"] 