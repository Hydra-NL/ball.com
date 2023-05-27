## MySQL & RabbitMQ draaien via Docker

1. Navigeer naar de MySQL & RabbitMQ folder
2. Gebruik de command `docker-compose -f docker-compose.yml up`
3. De container, image en persistent volume worden nu automatisch aangemaakt
4. MySQL is nu toegankelijk met de volgende gegevens:

- Database: ballcom
- Username: administrator
- Password: password123
- Host: localhost:3306

5. RabbitMQ is nu toegankelijk via http://localhost:15672 met inlog guest:guest
