FROM node:22-alpine
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation avec --force
RUN npm install --force

# Copie du reste du code
COPY . .
EXPOSE 3000
CMD ["npm","run","dev"]
