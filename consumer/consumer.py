import os
import pika
import time

host = os.environ.get('AMQP_HOST')
#inbox = os.environ.get('INBOX')
outbox = os.environ.get('OUTBOX')


def on_message(channel, method, properties, body):
    ''' handles message received from queue '''
    message = body.decode('UTF-8')
    print("message received: {}".format(message))


def main():
    ''' connects to rabbitmq, queue, starts consuming '''
    try:
        print("consumer: attempting to connect to {}".format(host))

        connection_params = pika.ConnectionParameters(host=host)
        connection = pika.BlockingConnection(connection_params)
        channel = connection.channel()

        print("queue: {}".format(outbox))

        channel.queue_declare(queue=outbox, durable=True)

        channel.basic_consume(
            queue=outbox, on_message_callback=on_message, auto_ack=True)

        print('consumer: subscribed to ' + outbox + ', waiting for messages...')

        channel.start_consuming()

    except Exception as e:
        print("consumer: connection error: {}".format(e))
        time.sleep(5)


if __name__ == '__main__':
    time.sleep(10)
    while (True):
        main()
