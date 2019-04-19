const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());
app.use('/', express.static(path.join(__dirname, '../public')));

app.use((req, res, next) => {
    console.log(req.url);
    next();
});

app.listen(process.env.PORT || 5000, (res) => {
    console.log('Server is running');
});