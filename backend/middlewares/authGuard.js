const jsonwebtoken = require("jsonwebtoken");

const authGuard = ( req, res , next) => {
    const { authorization } = req.headers;

    try {
        const token = authorization.split(' ')[1];
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const {id} = decoded;
        req.id = id ;
        next();
    } catch (error) {
        next('Authentication Failure!');
        
    }
}

module.exports = authGuard