FROM node:9-alpine

RUN npm install -g @angular/cli@latest

COPY . /var/app

WORKDIR /var/app

RUN npm install

EXPOSE 4200

#CMD [ "./node_modules/@angular/cli/bin/ng", "serve" ]

CMD [ "npm", "start" ]