## MySQL & RabbitMQ draaien via Docker

1. Gebruik de command `docker-compose -f docker-compose.yml up` in de root folder
2. De container, image en persistent volume worden nu automatisch aangemaakt
3. MySQL is nu toegankelijk met de volgende gegevens:

- Database: ballcom
- Username: administrator
- Password: password123
- Host: localhost:3306 (of **mysql-standalone** binnen als je API draait in Docker)

4. RabbitMQ is nu toegankelijk via http://localhost:15672 met inlog guest:guest (of **rabbitmq-queue** als je API draait in Docker)
