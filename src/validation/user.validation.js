const Joi = require("joi");
const { objectId, password } = require("./custom.Validation");
const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    username: Joi.string().required(),
  }),
};

module.exports = {
  register,
};
