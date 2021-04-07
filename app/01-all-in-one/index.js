import express from 'express';
import morgan from 'morgan';
import nodemailer from 'nodemailer';
import prom from 'prom-client';

prom.collectDefaultMetrics();
const register = prom.register;

const app = express();
app.use(express.json());
app.use(morgan('combined'));

const mailer = nodemailer.createTransport({
    host: 'toxiproxy',
    port: 1025,
});

const subscriptions = new Set();
new prom.Gauge({
    name: 'subscriptions_count',
    help: 'wat?',
    collect() {
        this.set(subscriptions.size);
    }
});
const emailCounter = new prom.Counter({
    name: 'app_email_counter',
    help: 'app_email_counter',
    labelNames: ['status'],
});
const responseSummary = new prom.Gauge({
    name: 'response_time',
    help: 'response_time',
});

app.get('/metrics', async (_req, res) => {
    res.send(await register.metrics());
});

app.get('/subscriptions', (_req, res) => {
    res.send({
        subscriptions: [...subscriptions],
    });
});

app.post('/subscriptions', (req, res) => {
    const { event_name: eventName } = req.body;
    subscriptions.add(eventName);

    res.status(201).end();
});

app.post('/trigger', async (req, res) => {
    const end = responseSummary.startTimer();
    const { event_name: eventName } = req.body;

    if (subscriptions.has(eventName)) {
        try {
            await mailer.sendMail(buildMessage(eventName));
            emailCounter.inc({ status: 'success' });
        } catch (e) {
            console.error('Error sending notification %s', e.message);
            emailCounter.inc({ status: 'failure' });
        }
    }

    end();
    res.status(201).end();
});

function buildMessage(eventName) {
    return {
        from: '"ChaosLabs" <chaos-labs@example.com>',
        to: 'receiver@locahost',
        subject: `Notificação: ${eventName}`,
        text: `Evento ${eventName}`,
        html: `Evento <b>${eventName}</b>`,
    };
}


app.listen(3000, () => {
    console.log('Listening at http://localhost:3000');
});
