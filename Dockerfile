FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm@9
COPY package.json ./
RUN pnpm install --no-frozen-lockfile --ignore-scripts
COPY . .
RUN rm -rf dist
RUN pnpm exec vite build
RUN pnpm exec esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
RUN ln -s /app/dist/public /app/public
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
