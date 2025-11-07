using Confluent.Kafka;

namespace GitVisualiserAPI.Kafka
{
    public static class KafkaProducer
    {
        public static ProducerConfig config = new ProducerConfig
        {
            // BootstrapServers = "localhost:9092"
            // Azure Container DNS for Kafka Broker
            BootstrapServers = "mykafka.evgxaxcrfefdgfcc.australiaeast.azurecontainer.io:9094",
        };

        public static async Task SendMessage(string data)
        {
            // Create a producer instance
            using var producer = new ProducerBuilder<Null, string>(config).Build();

            try
            {
                // Create a message to send
                var message = new Message<Null, string> { Value = data };

                // Send the message to the VisualGitTopic topic
                var deliveryReport = await producer.ProduceAsync("VisualGitTopic", message);

                Console.WriteLine($"Message successfully sent to topic: {deliveryReport.Topic}");
                Console.WriteLine($"Partition: {deliveryReport.Partition}");
                Console.WriteLine($"Offset: {deliveryReport.Offset}");
                Console.WriteLine($"Message: {deliveryReport.Message.Value}");
            }
            catch (ProduceException<Null, string> e)
            {
                Console.WriteLine($"Failed to deliver message: {e.Error.Reason}");
            }
            catch (Exception e)
            {
                Console.WriteLine($"An error occurred: {e.Message}");
            }

            Console.WriteLine("Producer finished. Press any key to exit...");
        }
    }
}
