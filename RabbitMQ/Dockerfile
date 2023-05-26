# Gebruik de officiele RabbitMQ image als basis
FROM rabbitmq:3-management

# Activeer het RabbitMQ management panel
RUN rabbitmq-plugins enable --offline rabbitmq_management

# Voeg een script toe om een queue te maken
COPY init.sh /usr/local/bin/

# Geef uitvoeringsrechten aan het script
RUN chmod +x /usr/local/bin/init.sh

# Start RabbitMQ en maak de queue indien nodig
CMD ["sh", "-c", "rabbitmq-server & sleep 10 && tail -F /var/log/rabbitmq/rabbit@localhost.log"]