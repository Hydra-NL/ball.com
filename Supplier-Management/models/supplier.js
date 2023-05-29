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

const Supplier = sequelize.define(
  "Supplier",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    supplier_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    supplier_address: {
      type: DataTypes.STRING,
      allowNull: false,
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
    console.log("Supplier table created successfully!");
    sequelize.query("SHOW TABLES").then((result) => {
      console.log(result[0]);
    });
  })
  .then(() => {
    pool.query(
      "CREATE TABLE IF NOT EXISTS Suppliers (id INT AUTO_INCREMENT PRIMARY KEY, supplier_name VARCHAR(255) NOT NULL, supplier_address VARCHAR(255) NOT NULL)"
    );
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = Supplier;
