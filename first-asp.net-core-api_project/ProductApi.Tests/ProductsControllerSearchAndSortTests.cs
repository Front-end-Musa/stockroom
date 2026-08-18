using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductApi.Controllers;
using ProductApi.Data;
using ProductApi.Dtos;
using ProductApi.Models;
using ProductApi.Services;

namespace ProductApi.Tests;

public sealed class ProductsControllerSearchAndSortTests
{
    public static TheoryData<string, string, int[]> SupportedSortCases => new()
    {
        { "name", "asc", [2, 3, 1] },
        { "name", "desc", [1, 3, 2] },
        { "price", "asc", [3, 1, 2] },
        { "price", "desc", [2, 1, 3] },
        { "stock", "asc", [2, 1, 3] },
        { "stock", "desc", [3, 1, 2] },
        { "createdAtUtc", "asc", [2, 1, 3] },
        { "createdAtUtc", "desc", [3, 1, 2] }
    };

    [Fact]
    public async Task GetAll_WithSearch_ReturnsCaseInsensitiveNameAndDescriptionMatches()
    {
        await using var dbContext = CreateDbContext();

        dbContext.Products.AddRange(
            CreateProduct(1, "Mechanical Keyboard", "Compact input device", 120, 8, 2),
            CreateProduct(2, "Desk Mat", "Sized for a KEYBOARD and mouse", 25, 12, 1),
            CreateProduct(3, "4K Monitor", "High-resolution display", 400, 4, 3));

        await dbContext.SaveChangesAsync();

        var controller = new ProductsController(new ProductService(dbContext));

        var result = await controller.GetAll(
            search: "  keyboard  ",
            page: 1,
            pageSize: 1,
            sortBy: "price",
            sortDirection: "asc");

        var response = GetResponse(result);

        Assert.Equal([2], response.Items.Select(product => product.Id));
        Assert.Equal(2, response.TotalItems);
        Assert.Equal(2, response.TotalPages);
        Assert.True(response.HasNextPage);
    }

    [Fact]
    public async Task GetAll_WithWhitespaceSearch_DoesNotFilterProducts()
    {
        await using var dbContext = CreateDbContext();

        dbContext.Products.AddRange(
            CreateProduct(1, "Beta", null, 20, 5, 2),
            CreateProduct(2, "Alpha", null, 30, 3, 1));

        await dbContext.SaveChangesAsync();

        var controller = new ProductsController(new ProductService(dbContext));

        var result = await controller.GetAll(
            search: "   ",
            sortBy: "name",
            sortDirection: "asc");

        var response = GetResponse(result);

        Assert.Equal([2, 1], response.Items.Select(product => product.Id));
        Assert.Equal(2, response.TotalItems);
    }

    [Theory]
    [MemberData(nameof(SupportedSortCases))]
    public async Task GetAll_SortsBySupportedFieldWithStableIdTieBreaker(
        string sortBy,
        string sortDirection,
        int[] expectedIds)
    {
        await using var dbContext = CreateDbContext();

        dbContext.Products.AddRange(
            CreateProduct(1, "Beta", null, 20, 5, 2),
            CreateProduct(2, "Alpha", null, 30, 3, 1),
            CreateProduct(3, "Alpha", null, 10, 5, 3));

        await dbContext.SaveChangesAsync();

        var controller = new ProductsController(new ProductService(dbContext));

        var result = await controller.GetAll(
            sortBy: sortBy,
            sortDirection: sortDirection);

        var response = GetResponse(result);

        Assert.Equal(expectedIds, response.Items.Select(product => product.Id));
    }

    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static PagedResponseDto<ProductResponseDto> GetResponse(
        ActionResult<PagedResponseDto<ProductResponseDto>> result)
    {
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        return Assert.IsType<PagedResponseDto<ProductResponseDto>>(okResult.Value);
    }

    private static Product CreateProduct(
        int id,
        string name,
        string? description,
        decimal price,
        int stock,
        int createdDay)
    {
        return new Product
        {
            Id = id,
            Name = name,
            Description = description,
            Price = price,
            Stock = stock,
            CreatedAtUtc = new DateTime(2026, 1, createdDay, 0, 0, 0, DateTimeKind.Utc)
        };
    }
}
