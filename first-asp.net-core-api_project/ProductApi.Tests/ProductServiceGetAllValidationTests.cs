using Microsoft.EntityFrameworkCore;
using ProductApi.Data;
using ProductApi.Services;

namespace ProductApi.Tests;

public sealed class ProductServiceGetAllValidationTests
{
    [Theory]
    [InlineData(0, 10, "name", "asc", "page", "Page must be at least 1.")]
    [InlineData(1, 0, "name", "asc", "pageSize", "Page size must be between 1 and 100.")]
    [InlineData(1, 101, "name", "asc", "pageSize", "Page size must be between 1 and 100.")]
    [InlineData(1, 10, "unknown", "asc", "sortBy", "Sort by must be one of: name, price, stock, createdAtUtc.")]
    [InlineData(1, 10, "name", "ascending", "sortDirection", "Sort direction must be either asc or desc.")]
    public async Task GetAllAsync_WithInvalidArgument_ReturnsValidationFailure(
        int page,
        int pageSize,
        string sortBy,
        string sortDirection,
        string expectedErrorKey,
        string expectedErrorMessage)
    {
        await using var dbContext = CreateDbContext();
        var service = new ProductService(dbContext);

        var result = await service.GetAllAsync(
            search: null,
            page,
            pageSize,
            sortBy,
            sortDirection);

        Assert.False(result.IsValid);
        Assert.Null(result.Response);
        var errors = Assert.Single(result.Errors);
        Assert.Equal(expectedErrorKey, errors.Key);
        Assert.Equal([expectedErrorMessage], errors.Value);
    }

    [Fact]
    public async Task GetAllAsync_WithMultipleInvalidArguments_ReturnsEveryValidationError()
    {
        await using var dbContext = CreateDbContext();
        var service = new ProductService(dbContext);

        var result = await service.GetAllAsync(
            search: null,
            page: 0,
            pageSize: 101,
            sortBy: "unknown",
            sortDirection: "ascending");

        Assert.False(result.IsValid);
        Assert.Null(result.Response);
        Assert.Equal(
            new[] { "page", "pageSize", "sortBy", "sortDirection" },
            result.Errors.Keys);
        Assert.Equal(["Page must be at least 1."], result.Errors["page"]);
        Assert.Equal(["Page size must be between 1 and 100."], result.Errors["pageSize"]);
        Assert.Equal(
            ["Sort by must be one of: name, price, stock, createdAtUtc."],
            result.Errors["sortBy"]);
        Assert.Equal(["Sort direction must be either asc or desc."], result.Errors["sortDirection"]);
    }

    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }
}
