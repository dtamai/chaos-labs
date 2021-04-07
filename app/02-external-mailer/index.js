import express from 'express';

const app = express();

app.get('/', (req, res) => {
    res.send('Hello, world!');
});

app.listen(3001, () => {
    console.log('Listening at http://localhost:3001');
});

