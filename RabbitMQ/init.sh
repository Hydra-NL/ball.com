#!/bin/sh

QUEUES=("customer" "supplier" "order" "delivery" "servicedepartment")

# Wacht tot RabbitMQ klaar is om verbindingen te accepteren
while ! rabbitmqctl status; do sleep 5; done

# Maak queues die nog niet bestaan
for QUEUE_NAME in "${QUEUES[@]}"
do
    EXISTING_QUEUE=$(rabbitmqctl list_queues --quiet --no-table-headers | grep -e "^${QUEUE_NAME} ")
    if [ -z "$EXISTING_QUEUE" ]; then
      rabbitmqadmin declare queue name=$QUEUE_NAME durable=true
      echo "Queue '${QUEUE_NAME}' aangemaakt."
    else
      echo "Queue '${QUEUE_NAME}' bestaat al."
    fi
done
