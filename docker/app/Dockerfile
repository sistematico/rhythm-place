FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json ./
RUN bun install

CMD ["bun", "--bun", "next", "dev", "-p", "3030"]
