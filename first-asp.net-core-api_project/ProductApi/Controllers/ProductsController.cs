using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductApi.Data;
using ProductApi.Dtos;
using ProductApi.Models;

namespace ProductApi.Controllers;

[ApiController]
[Route("api/products")]
public sealed class ProductsController(AppDbContext dbContext) : ControllerBase
{
    private const int MaxPageSize = 100;
    
    [HttpGet]
    [ProducesResponseType<PagedResponseDto<ProductResponseDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PagedResponseDto<ProductResponseDto>>> GetAll(
        string? search = null,
        int page = 1,
        int pageSize = 10,
        string sortBy = "createdAtUtc",
        string sortDirection = "desc",
        CancellationToken cancellationToken = default)
    {
        if (page < 1)
        {
            ModelState.AddModelError(nameof(page), "Page must be at least 1.");
        }

        if (pageSize < 1 || pageSize > MaxPageSize)
        {
            ModelState.AddModelError(
                nameof(pageSize),
                $"Page size must be between 1 and {MaxPageSize}.");
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var query = dbContext.Products.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%";

            query = query.Where(product =>
                EF.Functions.ILike(product.Name, pattern) ||
                product.Description != null && EF.Functions.ILike(product.Description, pattern));
        }
        
        var totalItems = await query.CountAsync(cancellationToken);

        var descending = !string.Equals(sortDirection, "asc", StringComparison.OrdinalIgnoreCase);

        query = sortBy.ToLowerInvariant() switch
        {
            "name" => descending
                ? query.OrderByDescending(product => product.Name)
                    .ThenByDescending(product => product.Id)
                : query.OrderBy(product => product.Name)
                    .ThenBy(product => product.Id),

            "price" => descending
                ? query.OrderByDescending(product => product.Price)
                    .ThenByDescending(product => product.Id)
                : query.OrderBy(product => product.Price)
                    .ThenBy(product => product.Id),

            "stock" => descending
                ? query.OrderByDescending(product => product.Stock)
                    .ThenByDescending(product => product.Id)
                : query.OrderBy(product => product.Stock)
                    .ThenBy(product => product.Id),
            _ => descending
                ? query.OrderByDescending(product => product.CreatedAtUtc)
                    .ThenByDescending(product => product.Id)
                : query.OrderBy(product => product.CreatedAtUtc)
                    .ThenBy(product => product.Id)
        };


        var products = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(ProductMappings.ToResponseProjection)
            .ToListAsync(cancellationToken);

        var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        var response = new PagedResponseDto<ProductResponseDto>(
            products,
            page,
            pageSize,
            totalItems,
            totalPages);

        return Ok(response);
    }

    [HttpGet("{id}")]
    [ProducesResponseType<ProductResponseDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductResponseDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var product = await dbContext.Products
            .AsNoTracking()
            .Where(product => product.Id == id)
            .Select(ProductMappings.ToResponseProjection)
            .FirstOrDefaultAsync(cancellationToken);

        return product is null ? NotFound() : Ok(product);
    }

    [HttpPost]
    [ProducesResponseType<ProductResponseDto>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ProductResponseDto>> Create(
        ProductRequestDto request,
        CancellationToken cancellationToken)
    {
        var product = new Product
        {
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            Stock = request.Stock
        };

        dbContext.Products.Add(product);
        await dbContext.SaveChangesAsync(cancellationToken);

        var response = product.ToResponseDto();

        return CreatedAtAction(nameof(GetById), new { id = product.Id }, response);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        int id,
        ProductRequestDto request,
        CancellationToken cancellationToken)
    {
        var product = await dbContext.Products.FindAsync([id], cancellationToken);

        if (product is null)
        {
            return NotFound();
        }

        product.Name = request.Name;
        product.Description = request.Description;
        product.Price = request.Price;
        product.Stock = request.Stock;

        await dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var product = await dbContext.Products.FindAsync([id], cancellationToken);

        if (product is null)
        {
            return NotFound();
        }

        dbContext.Products.Remove(product);
        await dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
