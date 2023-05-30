const { Sequelize, DataTypes } = require("sequelize");
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: "mysql-write",
  user: "administrator",
  password: "password123",
  database: "ballcom",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Configure the MySQL database connection
const sequelize = new Sequelize(
  'ballcom', // database name
  'administrator', // username
  'password123', // password
  {
    host: 'mysql-read', // MySQL container hostname (if running on the same machine as this app, or the IP address of the machine running the MySQL container, if running on separate machines)
    dialect: "mysql",
    logging: false,
  }
);

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customerId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    orderDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    products: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    totalPrice: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
  },
  {
    timestamps: false,
  }
);

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Order table created successfully!");
    // print all tables in the database
    sequelize
      .query("SHOW TABLES")
      .then((result) => {
        console.log(result[0]);
      })
      // also add Order table to the write database
      .then(() => {
        pool.query("CREATE TABLE IF NOT EXISTS Orders (id INT NOT NULL AUTO_INCREMENT, orderId VARCHAR(255) NOT NULL, customerId VARCHAR(255) NOT NULL, orderDate VARCHAR(255) NOT NULL, products JSON NOT NULL, totalPrice FLOAT NOT NULL, PRIMARY KEY (id))")
      })
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = Order;
