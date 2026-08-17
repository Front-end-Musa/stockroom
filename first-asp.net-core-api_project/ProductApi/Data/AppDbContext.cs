using Microsoft.EntityFrameworkCore;
using ProductApi.Models;

namespace ProductApi.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var product = modelBuilder.Entity<Product>();

        product.ToTable("products");
        product.HasKey(item => item.Id);

        product.Property(item => item.Name)
            .HasMaxLength(100)
            .IsRequired();

        product.Property(item => item.Description)
            .HasMaxLength(500);

        product.Property(item => item.Price)
            .HasPrecision(10, 2);

        product.Property(item => item.CreatedAtUtc)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");
    }
}
