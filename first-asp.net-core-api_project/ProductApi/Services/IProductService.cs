using ProductApi.Dtos;

namespace ProductApi.Services;

public interface IProductService
{
    Task<ProductListResult> GetAllAsync(
        string? search,
        int page,
        int pageSize,
        string? sortBy,
        string? sortDirection,
        CancellationToken cancellationToken = default);

    Task<ProductResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<ProductResponseDto> CreateAsync(
        ProductRequestDto request,
        CancellationToken cancellationToken = default);

    Task<bool> UpdateAsync(
        int id,
        ProductRequestDto request,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
