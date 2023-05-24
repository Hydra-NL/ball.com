const express = require("express");
const supplierRoute = require("./routes/supplier_routes");
const productRoute = require("./routes/product_routes");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const routes = (app) => {
  supplierRoute(app);
  productRoute(app);
};

routes(app);

app.use((err, res) => {
  res.status(422).send({ error: err._message });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
