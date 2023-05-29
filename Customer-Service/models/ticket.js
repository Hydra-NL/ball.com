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

const Ticket = sequelize.define(
  "Ticket",
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Open",
    },
    messages: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    timestamps: false,
  }
);

// Synchronize the models with the database
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Ticket table created successfully!");
    sequelize.query("SHOW TABLES").then((result) => {
      console.log(result[0]);
    });
  })
  .then(() => {
    console.log("Ticket table synchronized successfully!");
  })
  .catch((err) => {
    console.error("Unable to synchronize the Ticket table:", err);
  });

module.exports = Ticket;
