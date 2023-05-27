const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize("sqlite::memory:");

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
  })
  .catch((err) => {
    console.log(err);
  });


module.exports = Product;
