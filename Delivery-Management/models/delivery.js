const {Sequelize, DataTypes} = require("sequelize");
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
    "Delivery",
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
            type: DataTypes.STRING,
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
