using System.Threading.RateLimiting;
using GitVisualiserAPI.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

// Bind rate limiting configuration
var rateLimitingConfig = new RateLimitingConfig();
builder.Configuration.GetSection("RateLimiting").Bind(rateLimitingConfig);

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        name: MyAllowSpecificOrigins,
        policy =>
        {
            policy.WithOrigins(
                "http://localhost:1234",
                "http://localhost:4321",
                "http://localhost:5078",
                "http://localhost:5000",
                "https://lustrous-creponne-e68ef8.netlify.app",
                "https://visualgit.net",
                "http://localhost"
            );
        }
    );
});

builder.Services.AddControllers();

// Add rate limiting
builder.Services.AddRateLimiter(rateLimiterOptions =>
{
    // Global rate limiting policy
    rateLimiterOptions.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(
        httpContext =>
            RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                factory: partition => new FixedWindowRateLimiterOptions
                {
                    AutoReplenishment = true,
                    PermitLimit = rateLimitingConfig.GlobalPolicy.PermitLimit,
                    Window = TimeSpan.FromMinutes(rateLimitingConfig.GlobalPolicy.WindowInMinutes),
                }
            )
    );

    // Specific policy for API endpoints
    rateLimiterOptions.AddPolicy(
        "ApiPolicy",
        httpContext =>
            RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                factory: partition => new FixedWindowRateLimiterOptions
                {
                    AutoReplenishment = true,
                    PermitLimit = rateLimitingConfig.ApiPolicy.PermitLimit,
                    Window = TimeSpan.FromMinutes(rateLimitingConfig.ApiPolicy.WindowInMinutes),
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = rateLimitingConfig.ApiPolicy.QueueLimit,
                }
            )
    );

    // Named Global policy
    rateLimiterOptions.AddPolicy(
        "GlobalPolicy",
        httpContext =>
            RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                factory: partition => new FixedWindowRateLimiterOptions
                {
                    AutoReplenishment = true,
                    PermitLimit = rateLimitingConfig.GlobalPolicy.PermitLimit,
                    Window = TimeSpan.FromMinutes(rateLimitingConfig.GlobalPolicy.WindowInMinutes),
                }
            )
    );

    // Stricter policy for heavy operations
    rateLimiterOptions.AddPolicy(
        "StrictPolicy",
        httpContext =>
            RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                factory: partition => new FixedWindowRateLimiterOptions
                {
                    AutoReplenishment = true,
                    PermitLimit = rateLimitingConfig.StrictPolicy.PermitLimit,
                    Window = TimeSpan.FromMinutes(rateLimitingConfig.StrictPolicy.WindowInMinutes),
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = rateLimitingConfig.StrictPolicy.QueueLimit,
                }
            )
    );

    // Configure rejection response
    rateLimiterOptions.RejectionStatusCode = 429; // Too Many Requests
});

builder.Services.AddDbContext<GitInternalContext>(opt => opt.UseInMemoryDatabase("GitInternals"));

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseRateLimiter();

app.UseCors(MyAllowSpecificOrigins);

app.UseAuthorization();

app.MapControllers();

app.Run();
