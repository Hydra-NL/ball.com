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
  .catch((err) => {
    console.log(err);
  });

module.exports = Supplier;
