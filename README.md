## MySQL & RabbitMQ draaien via Docker

1. Gebruik de command `docker-compose -f docker-compose.yml up --build --force-recreate` in de root folder
2. De container, image en persistent volume worden nu automatisch aangemaakt
3. MySQL is nu toegankelijk met de volgende gegevens:

- Database: ballcom
- Username: administrator
- Password: password123
- Host: **mysql-write** voor write operaties en **mysql-read** voor read operaties

4. RabbitMQ is nu toegankelijk via http://localhost:15672 (web dashboard) met inlog guest:guest (en **rabbitmq-queue** als wanneer je de API draait in Docker)
