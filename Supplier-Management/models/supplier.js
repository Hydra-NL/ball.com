const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize("sqlite::memory:");

const Product = require("./product");

const Supplier = sequelize.define("Supplier", {
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
});

// Define the many-to-many relationship between Supplier and Product
Supplier.belongsToMany(Product, { through: "SupplierProduct" });
Product.belongsToMany(Supplier, { through: "SupplierProduct" });

// Synchronize the models with the database
sequelize
  .sync()
  .then(() => {
    console.log("Models synchronized with the database.");
  })
  .catch((error) => {
    console.error("Error synchronizing models:", error);
  });

module.exports = Supplier;
