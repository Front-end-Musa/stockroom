using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using ProductApi.Controllers;
using ProductApi.Data;
using ProductApi.Dtos;
using ProductApi.Models;

namespace ProductApi.Tests;

public sealed class ProductsControllerPaginationTests
{
    [Fact]
    public async Task GetAll_ReturnsRequestedPageWithMetadata()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        await using var dbContext = new AppDbContext(options);

        dbContext.Products.AddRange(
            CreateProduct(1, "Alpha"),
            CreateProduct(2, "Alpha"),
            CreateProduct(3, "Alpha"),
            CreateProduct(4, "Beta"),
            CreateProduct(5, "Gamma"));

        await dbContext.SaveChangesAsync();

        var controller = new ProductsController(dbContext);

        var result = await controller.GetAll(
            page: 2,
            pageSize: 2,
            sortBy: "name",
            sortDirection: "asc");

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response =
            Assert.IsType<PagedResponseDto<ProductResponseDto>>(okResult.Value);

        Assert.Equal(2, response.Page);
        Assert.Equal(2, response.PageSize);
        Assert.Equal(5, response.TotalItems);
        Assert.Equal(3, response.TotalPages);
        Assert.True(response.HasPreviousPage);
        Assert.True(response.HasNextPage);
        Assert.Equal([3, 4], response.Items.Select(product => product.Id));
    }

    private static Product CreateProduct(int id, string name)
    {
        return new Product
        {
            Id = id,
            Name = name,
            Price = 10,
            Stock = 1,
            CreatedAtUtc = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };
    }

    [Theory]
    [InlineData(0, 10, "page")]
    [InlineData(1, 0, "pageSize")]
    [InlineData(1, 101, "pageSize")]
    public async Task GetAll_WithInvalidPagination_ReturnsValidationProblem(
        int page,
        int pageSize,
        string expectedErrorKey)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        await using var dbContext = new AppDbContext(options);

        using var serviceProvider = new ServiceCollection()
            .AddLogging()
            .AddControllers()
            .Services
            .BuildServiceProvider();

        var controller = new ProductsController(dbContext)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    RequestServices = serviceProvider
                }
            }
        };

        var result = await controller.GetAll(
            page: page,
            pageSize: pageSize);

        var objectResult = Assert.IsAssignableFrom<ObjectResult>(result.Result);
        var problem =
            Assert.IsType<ValidationProblemDetails>(objectResult.Value);

        Assert.Equal(StatusCodes.Status400BadRequest, problem.Status);
        Assert.Contains(expectedErrorKey, problem.Errors.Keys);
    }
}
