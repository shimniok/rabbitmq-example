var express = require("express");
var router = express.Router();

var amqp = require("amqplib/callback_api");

const url = `amqp://${process.env.AMQP_HOST}`;
const queue = process.env.QUEUE_NAME;

console.log("RabbitMQ url", url);

let channel = null;
while (channel == null) {
  amqp.connect(url, function (err, conn) {
    if (conn) {
      conn.createChannel(function (err, ch) {
        channel = ch;
      });
    }
  });

}

process.on("exit", (code) => {
  channel.close();
  console.log(`Closing`);
});

router.post("/", function (req, res, next) {
  channel.sendToQueue(queue, new Buffer.from(req.body.message));
  res.render("index", { response: `Sent: ${req.body.message}` });
});

module.exports = router;
