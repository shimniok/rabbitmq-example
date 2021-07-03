#!/bin/bash

docker run -it --rm --hostname rabbit-producer --network mynet -p 3000:3000 -e QUEUE_NAME='my-queue' -e AMQP_HOST='rabbitmq' rabbit-producer
