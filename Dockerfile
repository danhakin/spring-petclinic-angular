FROM nginx

COPY petclinic.conf /etc/nginx/conf.d/default.conf

RUN mkdir -p /usr/share/nginx/html/petclinic

COPY ./dist /usr/share/nginx/html/petclinic/dist

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]