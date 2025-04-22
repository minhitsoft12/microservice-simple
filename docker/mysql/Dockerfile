FROM yobasystems/alpine-mariadb:10.11.8

ENV MYSQL_ROOT_PASSWORD=${DB_PASSWORD}
ENV MYSQL_DATABASE=${DB_DATABASE}
ENV MYSQL_USER=${DB_USERNAME}
ENV MYSQL_PASSWORD=${DB_PASSWORD}

COPY mysql.cnf /etc/mysql/conf.d/my.cnf
COPY create-testing-database.sh /docker-entrypoint-initdb.d/10-create-testing-database.sh

EXPOSE 3306