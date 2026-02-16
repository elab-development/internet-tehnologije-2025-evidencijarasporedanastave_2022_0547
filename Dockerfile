FROM node:20-alpine

WORKDIR /app

# Kopiramo samo pakete prvo zbog keširanja
COPY package*.json ./

# Instaliramo sve zavisnosti
RUN npm install

# Kopiramo ostatak koda
COPY . .

# Eksponiramo port 3000
EXPOSE 3000

# Pokrećemo u dev modu - ovo preskače "npm run build" grešku
CMD ["npm", "run", "dev"]