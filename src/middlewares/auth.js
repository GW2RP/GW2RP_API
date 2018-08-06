const Users = require('../controllers/userController');

function signIn() {
    return (req, res, next) => {
        const username = req.body.username;
        const password = req.body.password;

        if (!username || !password) {
            throw { message: "Missing username or password in body", id: "INVALID_CREDENTIALS", status: 400 };
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
                    status: 400,
                    message: "No user foud in body.",
                    id: "MISSING_USER"
                }
            });
        }
        
        Users.createOne(user).then(user => {
            return res.json({
                success: true,
                message: "User account created. Awaiting validation by email.",
                user
            });
        }).catch(next);
    }
}

function isAdmin() {
    return (req, res, next) => {
        if (!req.decoded || !req.decoded.admin) {
            throw { message: "Admin privilege required.", id: "USER_NOT_ADMIN", status: 403 };
        }
        return next();
    }
}

function hasToken() {
    return (req, res, next) => {
        if (req.authError) {
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
                req.authError = { message: "Header Authorization: Bearer <token> malformed or invalid.", id: "INVALID_TOKEN", status: 403 };
                req.authorization = {};
                return next();
            }
        } else {
            token = req.body.token;
        }
        
        if (!token) {
            req.authError = { message: "No token found in 'Authorization: Bearer <Token>' in header or in 'body: { token }'.", id: "NO_TOKEN", status: 403 };
            req.authorization = {};
            return next();
        }

        return Users.verifyToken(token).then(decoded => {
            req.decoded = decoded;
            req.authorization = {
                username: decoded.username,
                admin: decoded.admin
            }
            return next();
        }).catch(err => {
            req.authError = { message: err.message, id: "TOKEN_ERROR", status: 403 };
            req.authorization = {};
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