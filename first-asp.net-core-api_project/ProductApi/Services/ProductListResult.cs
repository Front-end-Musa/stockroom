using ProductApi.Dtos;

namespace ProductApi.Services;

public sealed class ProductListResult
{
    private ProductListResult(
        PagedResponseDto<ProductResponseDto>? response,
        IReadOnlyDictionary<string, string[]> errors)
    {
        Response = response;
        Errors = errors;
    }

    public PagedResponseDto<ProductResponseDto>? Response { get; }

    public IReadOnlyDictionary<string, string[]> Errors { get; }

    public bool IsValid => Errors.Count == 0;

    public static ProductListResult Success(PagedResponseDto<ProductResponseDto> response) =>
        new(response, new Dictionary<string, string[]>());

    public static ProductListResult ValidationFailure(IReadOnlyDictionary<string, string[]> errors) =>
        new(null, errors);
}
