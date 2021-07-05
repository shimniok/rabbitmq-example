var express = require("express");
var router = express.Router();

var amqp = require("amqplib/callback_api");

const url = `amqp://${process.env.AMQP_HOST}`;
const INBOX = "inbox";
const OUTBOX = "outbox";

async function waitAwhile(timeout) {
  console.log("waiting to connect...");
  return await new Promise((resolve, reject) => {
    setTimeout(() => resolve("done!"), timeout);
  });
}

function initConnect(r) {
  return new Promise((resolve, reject) => {
    console.log("attempting to connect to", url, "...");
    amqp.connect(url, function (err, conn) {
      if (err) {
        console.log("error connecting:", err.code);
        reject("error connecting");
      } else if (conn) {
        resolve(conn);
      } else {
        console.log("connection is null for some reason");
        reject("connection null for unknown reason");
      }
    });
  });
}

function initChannel(conn) {
  return new Promise((resolve, reject) => {
    console.log("connected; creating channel...");
    conn.createChannel(function (err, ch) {
      if (err) {
        console.log("error creating channel:", err.code);
        reject("error creating channel");
      } else {
        console.log("channel created.");
        resolve(ch);
      }
    });
  });
}

async function init() {
  ch = null;
  await waitAwhile(10000);
  return initConnect().then((conn) => {
    return initChannel(conn);
  });
}

var channel = null;

init().then((ch) => {
  channel = ch; // have to assign to channel else it won't work below; channel can't be a promise
  channel.assertQueue(INBOX, {
    durable: true,
  });
  channel.assertQueue(OUTBOX, {
    durable: true,
  });
  console.log("queues asserted");
});

process.on("exit", (code) => {
  console.log("closing");
  if (typeof channel == amqp.channel) {
    console.log("channel", channel);
    channel.close();
  }
});

router.post("/", function (req, res, next) {
  channel.sendToQueue(OUTBOX, new Buffer.from(req.body.message), { persistent: true});
  res.render("index", { response: `Sent: ${req.body.message}` });
});

module.exports = router;
