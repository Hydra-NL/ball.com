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

const Logistics = sequelize.define(
    "Logistics",
    {
        logisticsId: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                notNull: {msg: "Name is required"},
                notEmpty: {msg: "Name is required"},
            },
        },
        description: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        deliveryCosts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: {msg: "Delivery costs are required"},
                notEmpty: {msg: "Delivery costs are required"},
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
        console.log("Logistics table created successfully!");
        pool.query("CREATE TABLE IF NOT EXISTS Logistics (logisticsId VARCHAR(36) PRIMARY KEY, name VARCHAR(50) NOT NULL, description VARCHAR(255), deliveryCosts INT NOT NULL)");
    })
    .catch((err) => {
        console.log(err);
    });

module.exports = Logistics;
