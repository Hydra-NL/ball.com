const express = require("express");
const routes = require("./routes/routes");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;

const RabbitMQConsumer = require('./rabbitmq/rabbitMQ_consumer');
const RabbitMQRead = require('./rabbitmq/rabbitMQ_read');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

routes(app);

app.use((err, res) => {
  res.status(422).send({ error: err._message });
});

app.listen(port, () => {
  const consumer = new RabbitMQConsumer();
  consumer.listenToQueue();

  const read = new RabbitMQRead();
  read.listenToReadQueue();

  console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
