## Ball.com draaien via Docker
Dit project maakt gebruik van Docker om verschillende services te beheren zoals MySQL, RabbitMQ en verschillende management services. Volg de onderstaande instructies om het project te starten.

1. Gebruik de command `docker-compose -f docker-compose.yml up --build --force-recreate` in de root folder
2. Alle containers, images en persistent volumes worden nu automatisch aangemaakt

### MySQL
MySQL is toegankelijk met de volgende gegevens:
- Database: ballcom
- Username: administrator
- Password: password123
- Host: **mysql-write** voor write operaties en **mysql-read** voor read operaties

### RabbitMQ
RabbitMQ is toegankelijk via http://localhost:15672 (web dashboard) en **rabbitmq-queue** wanneer je RabbitMQ wilt bereiken via de API in Docker
- Username: guest
- Password: guest

### Event Store DB
Event Store DB is toegankelijk via http://localhost:2113 (web dashboard) en **eventstoredb** wanneer je Event Store DB wilt bereiken via de API in Docker

### Management Services
- Order Management: http://localhost:3000
- Customer Management: http://localhost:3001
- Supplier Management: http://localhost:3002
- Delivery Management: http://localhost:3003
- Customer Service: http://localhost:3004
- Invoice Management: http://localhost:3005

Zie het [Postman](https://github.com/Hydra-NL/ball.com/blob/master/Ball.com.postman_collection.json) bestand voor een overzicht van alle beschikbare endpoints
