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
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    orderDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    orderStatus: {
      type: DataTypes.STRING,
      defaultValue: "Pending",
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
      // also add Order table to the read database, include default for orderStatus
      .then(() => {
        pool.query("CREATE TABLE IF NOT EXISTS Orders (id INT AUTO_INCREMENT PRIMARY KEY, orderId VARCHAR(255) NOT NULL, customerId INT NOT NULL, orderDate VARCHAR(255) NOT NULL, orderStatus VARCHAR(255) NOT NULL DEFAULT 'Pending', productId INT NOT NULL, quantity INT NOT NULL)")
      })
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = Order;
