const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize(
  "ballcom", // database name
  "administrator", // username
  "password123", // password
  {
    host: "mysql-standalone", // MySQL container hostname (if running on the same machine as this app, or the IP address of the machine running the MySQL container, if running on separate machines)
    port: 3306,
    dialect: "mysql",
    logging: false,
  }
);

const Product = sequelize.define("Product", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  product_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: "Product name cannot be empty." },
      notNull: { msg: "Product name cannot be empty." },
    },
  },
  product_price: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: { msg: "Product price cannot be empty." },
      notNull: { msg: "Product price cannot be empty." },
    },
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: { msg: "Supplier ID cannot be empty." },
      notNull: { msg: "Supplier ID cannot be empty." },
    },
  },
});

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Product table created successfully!");
    sequelize.query("SHOW TABLES").then((result) => {
      console.log(result[0]);
    });
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = Product;
