const amqp = require("amqplib/callback_api");

class RabbitMQManager {
  constructor() {
    this.channel = null;
    this.setupConnection();
  }

  setupConnection() {
    amqp.connect("amqp://rabbitmq-queue", (errorConnect, connection) => {
      if (errorConnect) {
        throw errorConnect;
      }

      connection.createChannel((errorChannel, channel) => {
        if (errorChannel) {
          throw errorChannel;
        }

        const queue = "customer_queue";
        channel.assertQueue(queue, {
          durable: true,
        });

        this.channel = channel;
      });
    });
  }

  addMessage(message) {
    if (!this.channel) {
      console.log("[=>] Channel not yet initialized. Try again.");
      return;
    }

    const queue = "customer_queue";
    this.channel.sendToQueue(queue, Buffer.from(message), {
      persistent: true,
    });

    console.log("[=>] Sent %s to queue", message);
  }
}

module.exports = new RabbitMQManager();
