# AgroLease backend - plain, portable Node/Fastify container.
# No platform-specific SDK (Railway dropped project-wide). Runs locally
# now; moves to AWS (ECS/Fargate/EC2) later with no rework required.
FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY src ./src

EXPOSE 4000

ENV BACKEND_PORT=4000
ENV BACKEND_HOST=0.0.0.0

CMD ["node", "src/server.js"]
