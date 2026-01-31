namespace GitVisualiserAPI.Models
{
    public class RateLimitingConfig
    {
        public PolicyConfig GlobalPolicy { get; set; } = new();
        public PolicyConfig ApiPolicy { get; set; } = new();
        public PolicyConfig StrictPolicy { get; set; } = new();
    }

    public class PolicyConfig
    {
        public int PermitLimit { get; set; }
        public int WindowInMinutes { get; set; }
        public int QueueLimit { get; set; }
    }
}