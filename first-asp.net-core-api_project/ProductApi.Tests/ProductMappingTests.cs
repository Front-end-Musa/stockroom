using ProductApi.Dtos;
using ProductApi.Models;

namespace ProductApi.Tests;

public sealed class ProductMappingsTests
{
    [Fact]
    public void ToResponseDto_MapsEveryResponseField()
    {
        var product = CreateProduct();

        var result = product.ToResponseDto();

        AssertMapped(product, result);
    }

    [Fact]
    public void ToResponseProjection_MapsEveryResponseField()
    {
        var product = CreateProduct();
        var mapper = ProductMappings.ToResponseProjection.Compile();

        var result = mapper(product);

        AssertMapped(product, result);
    }

    private static Product CreateProduct()
    {
        return new Product
        {
            Id = 42,
            Name = "Mechanical keyboard",
            Description = "Wireless keyboard",
            Price = 89.99m,
            Stock = 12,
            CreatedAtUtc = new DateTime(
                2026,
                8,
                18,
                12,
                30,
                0,
                DateTimeKind.Utc)
        };
    }

    private static void AssertMapped(
        Product product,
        ProductResponseDto response)
    {
        Assert.Equal(product.Id, response.Id);
        Assert.Equal(product.Name, response.Name);
        Assert.Equal(product.Description, response.Description);
        Assert.Equal(product.Price, response.Price);
        Assert.Equal(product.Stock, response.Stock);
        Assert.Equal(product.CreatedAtUtc, response.CreatedAtUtc);
    }
}