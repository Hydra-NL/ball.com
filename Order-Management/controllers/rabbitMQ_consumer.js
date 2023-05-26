const amqp = require('amqplib/callback_api');
const mysql = require('mysql2');

class RabbitMQConsumer {
    constructor() {
        this.pool = mysql.createPool({
            host: "localhost",
            user: "administrator",
            password: "password123",
            database: "ballcom",
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        this.isCheckingDatabase = false;
    }

    executeQuery(channel, message) {
        const sqlQuery = message.content.toString();

        this.pool.query(sqlQuery, (err, result) => {
            if (err) {
                console.error("Error executing query:", err.message);
                if (!this.isCheckingDatabase) {
                    this.checkDatabaseAndResume(channel);
                }
            } else {
                console.log("[*] Query executed successfully: " + sqlQuery);
                channel.ack(message);
            }
        });
    }

    checkDatabaseAndResume(channel) {
        this.isCheckingDatabase = true;
        console.log("Checking database connection...");

        this.pool.query('SELECT 1', (error) => {
            if (error) {
                console.error("Database connection check failed. Retrying in 5 seconds...");
                setTimeout(() => this.checkDatabaseAndResume(channel), 5000);
            } else {
                console.log("Database connection check succeeded. Resuming message consumption...");
                this.isCheckingDatabase = false;
                channel.recover();
            }
        });
    }

    startConsuming(channel) {
        const queue = 'order_queue';

        channel.consume(queue, (message) => {
            this.executeQuery(channel, message);
        }, {
            noAck: false,
            consumerTag: 'myConsumer'
        });
    }

    listenToQueue() {
        amqp.connect('amqp://localhost', (errorConnect, connection) => {
            if (errorConnect) {
                console.error("Error connecting to RabbitMQ: ", errorConnect.message);
                setTimeout(() => this.listenToQueue(), 5000);
                return;
            }

            connection.createChannel((errorChannel, channel) => {
                if (errorChannel) {
                    console.error("Error creating channel: ", errorChannel.message);
                    setTimeout(() => this.listenToQueue(), 5000);
                    return;
                }

                const queue = 'order_queue';

                channel.assertQueue(queue, {
                    durable: true
                });

                console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queue);

                this.startConsuming(channel);
            });
        });
    }
}

module.exports = RabbitMQConsumer;