import { query, validationResult } from 'express-validator'

const validateRequest = async (req, res, next) => {
    const error = validationResult(req)
    if (!error.isEmpty()) {
        res.status(400).json({
            error: error.array(),
            success: false
        })
    }
    next();
}

const validSearch = [
    query("query").isString().notEmpty().withMessage("Query is required"),
    validateRequest
]

export default { validSearch }