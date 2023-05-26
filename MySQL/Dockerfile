# Gebruik de officiële MySQL-image als basis
FROM mysql:latest

# Voeg een aangepast configuratiebestand toe (my.cnf) in de container
COPY my.cnf /etc/mysql/conf.d/

# Voeg het run_mysql.sh script toe aan de container
COPY run_mysql.sh /usr/local/bin/

# Geef uitvoeringsrechten aan het script
RUN chmod +x /usr/local/bin/run_mysql.sh

# Start MySQL en voer het run_mysql.sh script uit, en log uitvoer naar /var/log/mysql/mysql.log
CMD ["sh", "-c", "mysqld & sleep 10 && run_mysql.sh && tail -F /var/log/mysql/mysql.log"]