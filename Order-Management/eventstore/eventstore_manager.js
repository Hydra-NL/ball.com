const { EventStoreDBClient, jsonEvent } = require("@eventstore/db-client");
const { eventstoredb: config } = require("../config.json");
const { FORWARDS } = require("@eventstore/db-client");

const connectionString = "esdb://eventstoredb?tls=false";
const client = EventStoreDBClient.connectionString(connectionString);

async function appendToStream(stream, eventName, eventData) {
    const event = jsonEvent({ type: eventName, data: eventData });
    await client.appendToStream(stream, [event]);

    const events = await getSpecificEvents(stream, 'OrderCreated');
    // loop over events
    for (const event of events) {
        console.log(event);
    }
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

module.exports = {
    appendToStream,
    readFromStream,
    getSpecificEvents
};