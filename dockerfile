FROM node:12
LABEL maintainer="admin"
LABEL description="This dockerfile for install the parking-lot-backend."

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install

# RUN npm install pm2 -g
# RUN pm2 install pm2-logrotate

COPY ./ ./
# RUN ls -a

ENV NODE_ENV production
# ENV TZ Asia/Bangkok
CMD ["npm", "run", "dev"]
# CMD [ \
#   "pm2-runtime", "bin/www", \
#   "--restart-delay", "60000", \
#   "--output", "logs/backend-output.log", \
#   "--error", "logs/backend-error.log" \
# ]
