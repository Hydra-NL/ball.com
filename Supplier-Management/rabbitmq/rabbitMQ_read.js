const amqp = require("amqplib/callback_api");
const mysql = require("mysql2");

class RabbitMQReadConsumer {
  constructor() {
    this.pool = mysql.createPool({
      host: "mysql-read",
      user: "administrator",
      password: "password123",
      database: "ballcom",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    this.isCheckingDatabase = false;
  }

  executeReadQuery(channel, message) {
    const sqlQuery = message.content.toString();

    this.pool.query(sqlQuery, (err, result) => {
      if (err) {
        console.error("[R | <=] Error executing query:", err.message);
        if (
          err.code === "PROTOCOL_CONNECTION_LOST" ||
          err.code === "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR" ||
          err.code === "PROTOCOL_ENQUEUE_AFTER_QUIT" ||
          err.code === "PROTOCOL_ENQUEUE_HANDSHAKE_TWICE"
        ) {
          if (!this.isCheckingDatabase) {
            this.checkDatabaseAndResume(channel);
          }
        } else {
          console.error(
            "[R | <=] Query execution failed. Acknowledging message..."
          );
          channel.ack(message);
        }
      } else {
        console.log("[R | <=] Query executed successfully: " + sqlQuery);
        channel.ack(message);
      }
    });
  }

  checkDatabaseAndResume(channel) {
    this.isCheckingDatabase = true;
    console.log("[R | <=] Checking database connection...");

    this.pool.query("SELECT 1", (error) => {
      if (error) {
        console.error(
          "[R | <=] Database connection check failed. Retrying in 5 seconds..."
        );
        setTimeout(() => this.checkDatabaseAndResume(channel), 5000);
      } else {
        console.log(
          "[R | <=] Database connection check succeeded. Resuming message consumption..."
        );
        this.isCheckingDatabase = false;
        channel.recover();
      }
    });
  }

  startConsuming(channel) {
    const readQueue = "supplier_replication_queue";

    channel.consume(
      readQueue,
      (message) => {
        this.executeReadQuery(channel, message);
      },
      {
        noAck: false,
        consumerTag: "readConsumer",
      }
    );
  }

  listenToReadQueue() {
    amqp.connect("amqp://rabbitmq-queue", (errorConnect, connection) => {
      if (errorConnect) {
        console.error(
          "[R | <=] Error connecting to RabbitMQ: ",
          errorConnect.message
        );
        setTimeout(() => this.listenToReadQueue(), 5000);
        return;
      }

      connection.createChannel((errorChannel, channel) => {
        if (errorChannel) {
          console.error(
            "[R | <=] Error creating channel: ",
            errorChannel.message
          );
          setTimeout(() => this.listenToReadQueue(), 5000);
          return;
        }

        const readQueue = "supplier_replication_queue";

        channel.assertQueue(readQueue, {
          durable: true,
        });

        console.log("[R | <=] Waiting for messages in %s", readQueue);

        this.startConsuming(channel);
      });
    });
  }
}

module.exports = RabbitMQReadConsumer;
