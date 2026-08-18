using Microsoft.EntityFrameworkCore;
using ProductApi.Data;
using ProductApi.Dtos;
using ProductApi.Models;

namespace ProductApi.Services;

public sealed class ProductService(AppDbContext dbContext) : IProductService
{
    private const int MaxPageSize = 100;
    private static readonly HashSet<string> SupportedSortFields =
        new(StringComparer.OrdinalIgnoreCase) { "name", "price", "stock", "createdAtUtc" };
    private static readonly HashSet<string> SupportedSortDirections =
        new(StringComparer.OrdinalIgnoreCase) { "asc", "desc" };

    public async Task<ProductListResult> GetAllAsync(
        string? search,
        int page,
        int pageSize,
        string? sortBy,
        string? sortDirection,
        CancellationToken cancellationToken = default)
    {
        var normalizedSortBy = sortBy?.Trim() ?? string.Empty;
        var normalizedSortDirection = sortDirection?.Trim() ?? string.Empty;
        var errors = new Dictionary<string, string[]>();

        if (page < 1)
        {
            errors[nameof(page)] = ["Page must be at least 1."];
        }

        if (pageSize < 1 || pageSize > MaxPageSize)
        {
            errors[nameof(pageSize)] = [$"Page size must be between 1 and {MaxPageSize}."];
        }

        if (!SupportedSortFields.Contains(normalizedSortBy))
        {
            errors[nameof(sortBy)] = ["Sort by must be one of: name, price, stock, createdAtUtc."];
        }

        if (!SupportedSortDirections.Contains(normalizedSortDirection))
        {
            errors[nameof(sortDirection)] = ["Sort direction must be either asc or desc."];
        }

        if (errors.Count != 0)
        {
            return ProductListResult.ValidationFailure(errors);
        }

        var query = dbContext.Products.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim().ToLowerInvariant();

            query = query.Where(product =>
                product.Name.ToLower().Contains(normalizedSearch) ||
                product.Description != null &&
                product.Description.ToLower().Contains(normalizedSearch));
        }

        var totalItems = await query.CountAsync(cancellationToken);
        var descending = string.Equals(normalizedSortDirection, "desc", StringComparison.OrdinalIgnoreCase);

        query = normalizedSortBy.ToLowerInvariant() switch
        {
            "name" => descending
                ? query.OrderByDescending(product => product.Name).ThenByDescending(product => product.Id)
                : query.OrderBy(product => product.Name).ThenBy(product => product.Id),
            "price" => descending
                ? query.OrderByDescending(product => product.Price).ThenByDescending(product => product.Id)
                : query.OrderBy(product => product.Price).ThenBy(product => product.Id),
            "stock" => descending
                ? query.OrderByDescending(product => product.Stock).ThenByDescending(product => product.Id)
                : query.OrderBy(product => product.Stock).ThenBy(product => product.Id),
            "createdatutc" => descending
                ? query.OrderByDescending(product => product.CreatedAtUtc).ThenByDescending(product => product.Id)
                : query.OrderBy(product => product.CreatedAtUtc).ThenBy(product => product.Id),
            _ => throw new InvalidOperationException("Sorting was not validated.")
        };

        var products = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(ProductMappings.ToResponseProjection)
            .ToListAsync(cancellationToken);

        return ProductListResult.Success(new PagedResponseDto<ProductResponseDto>(
            products,
            page,
            pageSize,
            totalItems,
            (int)Math.Ceiling(totalItems / (double)pageSize)));
    }

    public Task<ProductResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        dbContext.Products
            .AsNoTracking()
            .Where(product => product.Id == id)
            .Select(ProductMappings.ToResponseProjection)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<ProductResponseDto> CreateAsync(
        ProductRequestDto request,
        CancellationToken cancellationToken = default)
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

        return product.ToResponseDto();
    }

    public async Task<bool> UpdateAsync(
        int id,
        ProductRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var product = await dbContext.Products.FindAsync([id], cancellationToken);

        if (product is null)
        {
            return false;
        }

        product.Name = request.Name;
        product.Description = request.Description;
        product.Price = request.Price;
        product.Stock = request.Stock;

        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await dbContext.Products.FindAsync([id], cancellationToken);

        if (product is null)
        {
            return false;
        }

        dbContext.Products.Remove(product);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
