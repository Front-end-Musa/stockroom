using System.Linq.Expressions;
using ProductApi.Models;

namespace ProductApi.Dtos;

public static class ProductMappings
{
    public static readonly Expression<Func<Product, ProductResponseDto>> ToResponseProjection =
        product => new ProductResponseDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            Stock = product.Stock,
            CreatedAtUtc = product.CreatedAtUtc
        };

    public static ProductResponseDto ToResponseDto(this Product product)
    {
        return new ProductResponseDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            Stock = product.Stock,
            CreatedAtUtc = product.CreatedAtUtc
        };
    }
}
