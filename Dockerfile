# 1️⃣ Base image
FROM node:20-alpine

# 2️⃣ Set working directory
WORKDIR /app

# 3️⃣ Copy package.json & package-lock.json first (for caching)
COPY package*.json ./

# 4️⃣ Install dependencies
RUN npm install

# 5️⃣ Copy project files
COPY . .

# 6️⃣ Build the Next.js app
RUN npm run build

# 7️⃣ Expose port (match the docker run -p)
EXPOSE 3000

# 8️⃣ Start the app
CMD ["npm", "start"]