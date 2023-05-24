const {Sequelize, DataTypes} = require("sequelize");
const sequelize = new Sequelize("sqlite::memory:");

const Logistics = sequelize.define(
    "Logistics",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
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
    })
    .catch((err) => {
        console.log(err);
    });

module.exports = Logistics;
