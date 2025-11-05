using Confluent.Kafka;

namespace GitVisualiserAPI.Kafka
{
    public static class KafkaProducer
    {
        private static ProducerConfig config = new ProducerConfig
        {
            // BootstrapServers = "localhost:9092"
            // Azure Container DNS for Kafka Broker
            BootstrapServers = "apachekafka.dja4e7g9bhenbhe2.australiaeast.azurecontainer.io",
        };

        public static async Task SendMessage(string data)
        {
            // Create a producer instance
            using var producer = new ProducerBuilder<Null, string>(config).Build();

            try
            {
                // Create a message to send
                var message = new Message<Null, string>
                {
                    Value = $"Hello from Kafka producer! Timestamp: {DateTime.Now:yyyy-MM-dd HH:mm:ss}",
                };

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
