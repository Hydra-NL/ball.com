const {Sequelize, DataTypes} = require("sequelize");
const sequelize = new Sequelize("sqlite::memory:");

const Order = sequelize.define(
    "Order",
    {
        orderId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            validate: {
                notNull: {msg: "Order ID is required"},
                notEmpty: {msg: "Order ID is required"},
            },
        },
        logisticsId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: {msg: "Logistics company is required"},
                notEmpty: {msg: "Logistics company is required"},
            },
        },
        status: {
            type: DataTypes.ENUM("Inventory", "Planning", "Load on truck", "Delivery"),
            allowNull: false,
            validate: {
                notNull: {msg: "Status is required"},
                notEmpty: {msg: "Status is required"},
                isIn: [["Inventory", "Planning", "Load on truck", "Delivery"]]
            },
        }
    },
    {
        timestamps: false,
    }
);

sequelize
    .sync({force: false})
    .then(() => {
        console.log("Order table created successfully!");
    })
    .catch((err) => {
        console.log(err);
    });

module.exports = Order;
