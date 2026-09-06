import { body, validationResult } from "express-validator";

export const validateRequest = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({
      error: error.array(),
    });
  }
  next();
};

const validateSigninUser = [
  body("email").isEmail().notEmpty().withMessage("enter a valid email"),
  body("password")
    .isLength({
      min: 6,
    })
    .withMessage("password need to be atleast 6 digits long"),
  validateRequest,
];

const validateSignupUser = [
  body("email").isEmail().notEmpty().withMessage("enter a valid email"),
  body("password")
    .isLength({
      min: 6,
    })
    .withMessage("password need to be atleast 6 digits long"),
  body("fullname").notEmpty().withMessage("name is required"),
  body("contact")
    .notEmpty()
    .matches(/^\d{10}$/)
    .withMessage("contact needs to be 10 number long"),
  validateRequest,
];

export default { validateSignupUser, validateSigninUser };
