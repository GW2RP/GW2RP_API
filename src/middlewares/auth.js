const userController = require('../controllers/userController');

function signIn() {
    return (req, res, next) => {
        const username = req.body.username;
        const password = req.body.password;

        if (!username || !password) {
            res.status(400);
            throw { message: "Missing username or password in body", id: "INVALID_CREDENTIALS" };
        }

        return userController.signIn(username, password).then(token => {
            return res.json({ success: true, token });
        }).catch(err => {
            return next(err);
        });
    }
}

function isAdmin() {
    return (req, res, next) => {
        if (!req.decoded || !req.decoded.admin) {
            throw { message: "Admin privilege required.", id: "NOT_ADMIN" };
        }
        return next();
    }
}

function hasToken() {
    return (req, res, next) => {
        // Search for token...
        let token;
        let authorization = req.get("Authorization");
        if (authorization) {
            if (authorization.split("Bearer ").length === 2) {
                token = authorization.split("Bearer ")[1];
            } else {
                res.status(403);
                throw { message: "Header Authorization: Bearer <token> malformed or invalid.", id: "INVALID_TOKEN" };
            }
        } else {
            token = req.body.token;
        }
        
        if (!token) {
            res.status(403);
            throw { message: "No token found in 'Authorization: Bearer <Token>' in header or in 'body: { token }'.", id: "NO_TOKEN" };
        }

        return userController.verifyToken(token).then(decoded => {
            req.decoded = decoded;
            return next();
        }).catch(err => {
            return next(err);
        })
    }
}

module.exports = {
    signIn,
    isAdmin,
    hasToken
};