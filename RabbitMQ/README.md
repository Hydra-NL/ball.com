## RabbitMQ draaien via Docker

1. Navigeer naar de RabbitMQ folder
2. Build de RabbitMQ Docker image: `docker build -t rabbitmq-queue .`
3. Start een Docker-container met de nieuwe image: `docker run -d --hostname rabbitmq-queue-host --name rabbitmq--queue-container -p 5672:5672 -p 15672:15672 rabbitmq-queue`
4. RabbitMQ is nu toegankelijk via http://localhost:15672 met inlog guest:guest

Er wordt automatisch een queue aangemaakt genaamd `ball_queue`
