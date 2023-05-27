const Question = require("../models/question");
const Customer = require("../models/customer");

module.exports = {
  create(req, res, next) {
    const questionProps = req.body;

    // Check if the customer exists
    Customer.findByPk(req.body.customerId)
      .then((customer) => {
        if (!customer) {
          return res.status(404).json({ error: "Customer not found" });
        }

        // Customer exists, create the question
        Question.create(questionProps)
          .then((question) => res.send(question))
          .catch(next);
      })
      .catch(next);
  },

  index(req, res, next) {
    Question.findAll()
      .then((questions) => {
        res.send(questions);
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  },

  indexOne(req, res, next) {
    const questionId = req.params.id;

    Question.findByPk(questionId)
      .then((question) => {
        res.send(question);
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  },

  setAnswered(req, res, next) {
    const questionId = req.params.id;

    Question.findByPk(questionId)
      .then((question) => {
        if (question) {
          question.answered = true;
          question
            .save()
            .then(() => {
              // Reload the updated question from the database
              question
                .reload()
                .then((updatedQuestion) => {
                  // Return the updated question in the response body
                  res.send(updatedQuestion);
                })
                .catch((err) => {
                  console.error(err);
                  next(err);
                });
            })
            .catch((err) => {
              console.error(err);
              next(err);
            });
        } else {
          res.status(404).send("Question not found");
        }
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  },
};
