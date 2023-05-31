const { EventStoreDBClient, jsonEvent, SubscribeToAllOptions } = require("@eventstore/db-client");
const { eventstoredb: config } = require("../config.json");
const { FORWARDS } = require("@eventstore/db-client");
const rabbitMQManager = require('../rabbitmq/rabbitMQ_publisher');
const connectionString = "esdb://eventstoredb?tls=false";
const client = EventStoreDBClient.connectionString(connectionString);
const uuid = require("uuid");
const Invoice = require("../models/invoice");

async function subscribeToStream() {
    // make subscription to events, only listen to new events coming in after subscription
    const subscription = client.subscribeToAll();

    for await (const resolvedEvent of subscription) {
        const event = resolvedEvent.event;
        if (event.type === "OrderCreated") {
            const customerId = event.data.customerId;
            const orderId = event.data.orderId;
            const invoiceId = uuid.v4();
            const invoiceStatus = "Unpaid";
            const invoiceDate = new Date().toISOString().slice(0, 10);
            const totalPrice = event.data.totalPrice;
            // check if invoice with customerId and orderId already exists
            Invoice.findOne({ where: { customerId: customerId, orderId: orderId } })
                .then((invoice) => {
                    // if invoice exists, do nothing
                    if (invoice == null) {
                        console.log("Invoice created: " + invoiceId);
                        appendToStream(
                            `Invoice-${invoiceId}`,
                            "InvoiceCreated",
                            {
                                invoiceId,
                                customerId,
                                orderId,
                                invoiceStatus,
                                invoiceDate,
                                totalPrice
                            }
                        );
                        rabbitMQManager.addMessage("INSERT INTO Invoices (invoiceId, orderId, customerId, invoiceDate, totalPrice, status) VALUES ('" + invoiceId + "', '" + orderId + "', '" + customerId + "', '" + invoiceDate + "', '" + totalPrice + "', '" + invoiceStatus + "')");
                        return invoiceId;
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }
}

async function appendToStream(stream, eventName, eventData) {
    const event = jsonEvent({ type: eventName, data: eventData });
    await client.appendToStream(stream, [event]);
}

async function readFromStream(stream) {
    const events = client.readStream(stream);
    return events;
}

async function getSpecificEvents(stream, eventName) {
    const allEvents = await readFromStream(stream);
    const specificEvents = [];

    for await (const resolvedEvent of allEvents) {
        const event = resolvedEvent.event;
        if (event.type === eventName) {
            specificEvents.push(event);
        }
    }

    return specificEvents;
}

subscribeToStream();

module.exports = {
    appendToStream,
    readFromStream,
    getSpecificEvents
};