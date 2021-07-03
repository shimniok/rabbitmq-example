import os
import pika
import time

host = os.environ.get('AMQP_HOST')
queue = os.environ.get('QUEUE_NAME')


def on_message(ch, method, properties, body):
    message = body.decode('UTF-8')
    print(message)


def main():
    try:
        print("consumer: attempting to connect to {}".format(host))
        
        connection_params = pika.ConnectionParameters(host=host)
        connection = pika.BlockingConnection(connection_params)
        channel = connection.channel()

        channel.queue_declare(queue=queue)

        channel.basic_consume(
            queue=queue, on_message_callback=on_message, auto_ack=True)

        print('consumer: subscribed to ' + queue + ', waiting for messages...')

        channel.start_consuming()

    except Exception as e:
        print("consumer: connection error: {}".format(e))
        time.sleep(5)
        pass


if __name__ == '__main__':
    while (True):
        main()
