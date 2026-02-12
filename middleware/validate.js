// ==========================================
// KAYSAR: Validation Middleware
// ==========================================

const Joi = require('joi');

const validateTask = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().max(1000).allow(''),
    status: Joi.string().valid('todo', 'in-progress', 'completed'),
    priority: Joi.string().valid('low', 'medium', 'high'),
    category: Joi.string().valid('work', 'personal', 'urgent', 'other'),
    assignedTo: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    dueDate: Joi.date().iso()
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message
    });
  }

  next();
};

const validateComment = (req, res, next) => {
  const schema = Joi.object({
    text: Joi.string().min(1).max(500).required()
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message
    });
  }

  next();
};

module.exports = { validateTask, validateComment };
