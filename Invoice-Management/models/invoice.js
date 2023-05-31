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

const Invoice = sequelize.define(
  "Invoice",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    invoiceId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customerId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    invoiceDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "Unpaid",
    },
  },
  {
    timestamps: false,
  }
);

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Invoice table created successfully!");
    // print all tables in the database
    sequelize
      .query("SHOW TABLES")
      .then((result) => {
        console.log(result[0]);
      })
      // also add Invoice table to the write database
      .then(() => {
        pool.query(
          "CREATE TABLE IF NOT EXISTS Invoices (id INT AUTO_INCREMENT PRIMARY KEY, invoiceId VARCHAR(255) NOT NULL, orderId VARCHAR(255) NOT NULL, customerId VARCHAR(255) NOT NULL, invoiceDate VARCHAR(255) NOT NULL, totalPrice FLOAT DEFAULT 0, status VARCHAR(255))"
        );
      });
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = Invoice;
