FROM node:20-alpine
WORKDIR /app

# Install dependencies for bcrypt
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

# on copie tout le code d'un coup, y compris prisma/
COPY . .

# puis on génère le client
RUN npx prisma generate

EXPOSE 3001
CMD ["npm","run","start:dev"]
