const { Sequelize, DataTypes } = require("sequelize");
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "mysql-write",
  user: "administrator",
  password: "password123",
  database: "ballcom",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Configure the MySQL database connection
const sequelize = new Sequelize(
  "ballcom", // database name
  "administrator", // username
  "password123", // password
  {
    host: "mysql-read", // MySQL container hostname (if running on the same machine as this app, or the IP address of the machine running the MySQL container, if running on separate machines)
    dialect: "mysql",
    logging: false,
  }
);

const Customer = sequelize.define(
  "Customer",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customerId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notNull: { msg: "First name is required" },
        notEmpty: { msg: "First name is required" },
      },
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notNull: { msg: "Last name is required" },
        notEmpty: { msg: "Last name is required" },
      },
    },
    address: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notNull: { msg: "Address is required" },
        notEmpty: { msg: "Address is required" },
      },
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notNull: { msg: "City is required" },
        notEmpty: { msg: "City is required" },
      },
    },
    zip: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notNull: { msg: "Zip is required" },
        notEmpty: { msg: "Zip is required" },
      },
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      isUnique: true,
      validate: {
        notNull: { msg: "Email is required" },
        notEmpty: { msg: "Email is required" },
        isEmail: { msg: "Invalid email format" },
      },
    },
    hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: { msg: "Password is required" },
        notEmpty: { msg: "Password is required" },
      },
    },
    shoppingCart: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
  },
  {
    timestamps: false,
  }
);

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Customer table created successfully!");
    // print all tables in the database
    sequelize
      .query("SHOW TABLES")
      .then((result) => {
        console.log(result[0]);
      })
      // also add Customer table to the write database, include default for shoppingCart
      .then(() => {
        pool.query(
          "CREATE TABLE IF NOT EXISTS Customers (id INT AUTO_INCREMENT PRIMARY KEY, customerId VARCHAR(255) NOT NULL, firstName VARCHAR(50) NOT NULL, lastName VARCHAR(50) NOT NULL, address VARCHAR(50) NOT NULL, city VARCHAR(50) NOT NULL, zip VARCHAR(50) NOT NULL, email VARCHAR(50) NOT NULL UNIQUE, hash VARCHAR(255) NOT NULL, shoppingCart JSON DEFAULT '[]'"
        );
      });
  })
  .catch((err) => {
    console.log(err);
  });

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Customer table created successfully!");
    // print all tables in the database
    sequelize.query("SHOW TABLES").then((result) => {
      console.log(result[0]);
    });
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = Customer;
