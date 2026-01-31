using Microsoft.EntityFrameworkCore;

namespace GitVisualiserAPI.Models;

public class GitInternalContext : DbContext
{
    public GitInternalContext(DbContextOptions<GitInternalContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<GitInternal>()
            .HasKey(c => new { c.UserId, c.Id });
    }

    public DbSet<GitInternal> GitInternals { get; set; } = null!;
}