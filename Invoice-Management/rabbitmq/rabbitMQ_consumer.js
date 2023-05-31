const amqp = require('amqplib/callback_api');
const mysql = require('mysql2');

class RabbitMQConsumer {
    constructor() {
        this.pool = mysql.createPool({
            host: "mysql-write",
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
                console.error("[W | <=] Error executing query:", err.message);
                // check if the error is due to a lost connection to the database or anything related to the connection
                if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR' || err.code === 'PROTOCOL_ENQUEUE_AFTER_QUIT' || err.code === 'PROTOCOL_ENQUEUE_HANDSHAKE_TWICE') {
                    if (!this.isCheckingDatabase) {
                        this.checkDatabaseAndResume(channel);
                    }
                } else {
                    console.error("[W | <=] Query execution failed. Acknowledging message...");
                    channel.ack(message);
                }
            } else {
                console.log("[W | <=] Query executed successfully: " + sqlQuery);
                this.sendToReplicationQueue(channel, sqlQuery);
                channel.ack(message);
            }
        });
    }

    checkDatabaseAndResume(channel) {
        this.isCheckingDatabase = true;
        console.log("[W | <=] Checking database connection...");

        this.pool.query('SELECT 1', (error) => {
            if (error) {
                console.error("[W | <=] Database connection check failed. Retrying in 5 seconds...");
                setTimeout(() => this.checkDatabaseAndResume(channel), 5000);
            } else {
                console.log("[W | <=] Database connection check succeeded. Resuming message consumption...");
                this.isCheckingDatabase = false;
                channel.recover();
            }
        });
    }

    startConsuming(channel) {
        const queue = 'invoice_queue';

        channel.consume(queue, (message) => {
            this.executeQuery(channel, message);
        }, {
            noAck: false,
            consumerTag: 'myConsumer'
        });
    }

    sendToReplicationQueue(channel, sqlQuery) {
        const replicationQueue = 'invoice_replication_queue';

        channel.assertQueue(replicationQueue, {
            durable: true
        });

        channel.sendToQueue(replicationQueue, Buffer.from(sqlQuery), {
            persistent: true
        });

        console.log("[R | =>] Replication message sent: " + sqlQuery);
    }

    listenToQueue() {
        amqp.connect('amqp://rabbitmq-queue', (errorConnect, connection) => {
            if (errorConnect) {
                console.error("[W | <=] Error connecting to RabbitMQ: ", errorConnect.message);
                setTimeout(() => this.listenToQueue(), 5000);
                return;
            }

            connection.createChannel((errorChannel, channel) => {
                if (errorChannel) {
                    console.error("[W | <=] Error creating channel: ", errorChannel.message);
                    setTimeout(() => this.listenToQueue(), 5000);
                    return;
                }

                const queue = 'invoice_queue';

                channel.assertQueue(queue, {
                    durable: true
                });

                console.log('[W | <=] Waiting for messages in %s', queue);

                this.startConsuming(channel);
            });
        });
    }
}

module.exports = RabbitMQConsumer;