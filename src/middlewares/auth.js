const Users = require('../controllers/userController');

function signIn() {
    return (req, res, next) => {
        const username = req.body.username;
        const password = req.body.password;

        if (!username || !password) {
            res.status(400);
            throw { message: "Missing username or password in body", id: "INVALID_CREDENTIALS" };
        }

        return Users.signIn(username, password).then(token => {
            return res.json({ success: true, token });
        }).catch(err => {
            return next(err);
        });
    }
}

function signUp() {
    return (req, res, next) => {
        const user = req.body.user;
        if (!user) {
            return res.status(403).json({
                success: false,
                error: {
                    message: "No user foud in body.",
                    id: "MISSING_USER"
                }
            });
        }
        
        Users.createOne(user).then(user => {
            return res.sendStatus(501);
        }).catch(next);
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
        if (req.authError) {
            res.status(403);
            throw req.authError;
        }
        return next();
    }
}

function tokenData() {
    return (req, res, next) => {
        // Search for token...
        let token;
        let authorization = req.get("Authorization");
        if (authorization) {
            if (authorization.split("Bearer ").length === 2) {
                token = authorization.split("Bearer ")[1];
            } else {
                req.authError = { message: "Header Authorization: Bearer <token> malformed or invalid.", id: "INVALID_TOKEN" };
                return next();
            }
        } else {
            token = req.body.token;
        }
        
        if (!token) {
            req.authError = { message: "No token found in 'Authorization: Bearer <Token>' in header or in 'body: { token }'.", id: "NO_TOKEN" };
            return next();
        }

        return Users.verifyToken(token).then(decoded => {
            req.decoded = decoded;
            return next();
        }).catch(err => {
            req.authError = { message: err.message, id: "TOKEN_ERROR" };
            return next();
        });
    }
}

module.exports = {
    signIn,
    signUp,
    isAdmin,
    hasToken,
    tokenData
};