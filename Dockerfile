FROM node

RUN npm install -g @angular/cli@latest

RUN mkdir -p /usr/src/spring-petclient-front
WORKDIR /usr/src/spring-petclient-front

COPY package.json /usr/src/spring-petclient-front
#RUN npm install --save-dev @angular/cli@latest && rm package-lock.json
RUN npm install

COPY . /usr/src/spring-petclient-front

EXPOSE 4200

RUN cmd & ls -la

#CMD [ "./node_modules/@angular/cli/bin/ng", "serve" ]

CMD [ "npm", "start" ]