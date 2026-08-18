using System.ComponentModel.DataAnnotations;

namespace ProductApi.Dtos;

public sealed class ProductRequestDto
{
    private string _name = string.Empty;
    private string? _description;

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name
    {
        get => _name;
        set => _name = value?.Trim() ?? string.Empty;
    }

    [StringLength(500)]
    public string? Description
    {
        get => _description;
        set
        {
            var normalized = value?.Trim();
            _description = string.IsNullOrEmpty(normalized)
                ? null
                : normalized;
        }
    }

    [Range(typeof(decimal), "0.01", "99999999.99")]
    public decimal Price { get; set; }

    [Range(0, int.MaxValue)]
    public int Stock { get; set; }
}

