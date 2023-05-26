#!/bin/sh

QUEUE_NAME="order_queue"

# Wacht tot RabbitMQ klaar is om verbindingen te accepteren
while ! rabbitmqctl status; do sleep 5; done

# Controleer of de queue al bestaat
EXISTING_QUEUE=$(rabbitmqctl list_queues --quiet --no-table-headers | grep -e "^${QUEUE_NAME} ")

if [ -z "$EXISTING_QUEUE" ]; then
  # Maak de queue
  rabbitmqadmin declare queue name=$QUEUE_NAME durable=true
  echo "Queue '${QUEUE_NAME}' aangemaakt."
else
  echo "Queue '${QUEUE_NAME}' bestaat al."
fi