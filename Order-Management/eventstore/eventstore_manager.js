const { EventStoreDBClient, jsonEvent, SubscribeToAllOptions } = require("@eventstore/db-client");
const { eventstoredb: config } = require("../config.json");
const { FORWARDS } = require("@eventstore/db-client");
const listenEvents = ["OrderCreated"];

const connectionString = "esdb://eventstoredb?tls=false";
const client = EventStoreDBClient.connectionString(connectionString);

async function subscribeToStream() {
    // make subscription to events, only listen to new events coming in after subscription
    const subscription = client.subscribeToAll();

    for await (const resolvedEvent of subscription) {
        const event = resolvedEvent.event;
        if (listenEvents.includes(event.type)) {
            // console.log(`Received event: ${event.type}`);
            // console.log(event.data);
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