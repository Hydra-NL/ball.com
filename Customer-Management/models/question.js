const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize("sqlite::memory:");

const Question = sequelize.define(
  "Question",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    question: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notNull: { msg: "Question is required" },
        notEmpty: { msg: "Question is required" },
      },
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { notNull: { msg: "Customer ID is required" } },
    },
    answer: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    answered: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: false,
  }
);

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Question table created successfully!");
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = Question;
