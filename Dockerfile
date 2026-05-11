FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY package.json ./
RUN pnpm install --no-frozen-lockfile
COPY . .
RUN rm -rf dist
RUN NODE_ENV=production pnpm run build
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
