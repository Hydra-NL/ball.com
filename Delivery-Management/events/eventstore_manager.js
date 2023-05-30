const {EventStoreDBClient, jsonEvent} = require("@eventstore/db-client");
const Util = require("../util/util")

const client = EventStoreDBClient.connectionString("esdb://eventstoredb?tls=false");

async function subscribeToStream() {
    // make subscription to events, only listen to new events coming in after subscription
    const subscription = client.subscribeToAll();

    for await (const resolvedEvent of subscription) {
        const event = resolvedEvent.event;
        if (event.type === "OrderCreated") {
            await Util.createDelivery(event.data)
        }
    }
}

async function appendToStream(stream, eventName, eventData) {
    const event = jsonEvent({type: eventName, data: eventData});
    await client.appendToStream(stream, [event]);
}

async function readFromStream(stream) {
    return client.readStream(stream);
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