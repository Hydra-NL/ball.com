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

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    product_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    product_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    supplier_id: {
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
    console.log("Product table created successfully!");
    sequelize.query("SHOW TABLES").then((result) => {
      console.log(result[0]);
    });
  })
  .then(() => {
    pool.query(
      "CREATE TABLE IF NOT EXISTS Products (id INT NOT NULL AUTO_INCREMENT, product_name VARCHAR(255) NOT NULL, product_price INT NOT NULL, supplier_id INT NOT NULL, PRIMARY KEY (id));"
    );
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = Product;
