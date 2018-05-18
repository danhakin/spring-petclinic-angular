FROM node:9-alpine

RUN npm install -g @angular/cli@latest

RUN mkdir -p /var/app/spring-petclient-front
WORKDIR /var/app/spring-petclient-front

COPY package.json /var/app/spring-petclient-front
RUN npm install

COPY . /var/app/spring-petclient-front

EXPOSE 4200

#CMD [ "./node_modules/@angular/cli/bin/ng", "serve" ]

CMD [ "npm", "start" ]