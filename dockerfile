FROM node:12
LABEL maintainer="Sompol"
LABEL description="This dockerfile for install the custom-tcels-backend."

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install --production

RUN npm install pm2 -g
RUN pm2 install pm2-logrotate

COPY ./ ./
RUN ls -a

ENV NODE_ENV production
ENV TZ Asia/Bangkok
CMD [ \
  "pm2-runtime", "bin/www", \
  "--restart-delay", "60000", \
  "--output", "logs/custom-tcels-backend-output.log", \
  "--error", "logs/custom-tcels-backend-error.log" \
]

# [ miracle ]
# git pull && sudo docker container stop custom-tcels-backend && sudo docker container rm custom-tcels-backend && sudo docker build -t local:custom-tcels-backend -f dockerfile . && sudo docker container run -d -it --name custom-tcels-backend -p 4018:4018 -v /home/user01/apps/logs:/app/logs --restart always local:custom-tcels-backend

# [ deployment ]
# sudo docker build -t local:custom-tcels-backend -f dockerfile .
# sudo docker container run -d -it --name custom-tcels-backend -p 4018:4018 -v /home/user01/apps/logs:/app/logs --restart always local:custom-tcels-backend

# [ monitoring ]
# sudo docker container ls
# sudo docker container logs -f custom-tcels-backend

# [ cleanup ]
# sudo docker container stop custom-tcels-backend
# sudo docker container rm custom-tcels-backend

# [ shell ]
# sudo docker container exec -i custom-tcels-backend /bin/sh
