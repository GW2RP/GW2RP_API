const express = require('express');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 8080;

app.use(cors());

app.use(express.json());
app.use((err, req, res, next) => {
    return res.status(400).json({
        success: false,
        error: {
            message: "Provided JSON in body could not be parsed.",
            id: "INVALID_BODY"
        }
    });
});
app.use(express.urlencoded({ extended: true }));

app.use(require('./router')());

app.listen(PORT, err => {
    if (err) {
        console.error("Could not start application server.");
        console.error(err);
        process.exit();
    }
    console.info("GW2RP Tool API up and running on port " + PORT);
});