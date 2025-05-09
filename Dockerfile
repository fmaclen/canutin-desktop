FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl1.1-compat

WORKDIR /canutin

ENV HOST "0.0.0.0"
ENV PORT "42069"
ENV SHOULD_CHECK_VAULT "true"
ENV DATABASE_URL "file:../vaults/Canutin.vault"

COPY /sveltekit/package.json .
COPY /sveltekit/package-lock.json .
COPY /sveltekit/build .
COPY /sveltekit/prisma ./prisma
COPY /scripts/docker-entrypoint.sh .

# Installing production dependencies
RUN npm ci --omit=dev

# Generating Prisma's artifacts
RUN npx prisma generate

# Creating vaults directory
RUN mkdir vaults

# Setting the entrypoint script as executable
RUN chmod +x docker-entrypoint.sh

# Start the server
ENTRYPOINT ["/bin/sh", "docker-entrypoint.sh"]
