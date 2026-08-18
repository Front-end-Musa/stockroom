using System.ComponentModel.DataAnnotations;
using ProductApi.Dtos;

namespace ProductApi.Tests;

public sealed class ProductRequestDtoTest
{
    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(" a ")]
    public void Name_InvalidAfterNormalization_IsRejected(string name)
    {
        var request = CreateValidRequest();
        request.Name = name;

        var isValid = Validate(request);

        Assert.False(isValid);
    }

    [Fact]
    public void Name_IsTrimmedBeforeValidation()
    {
        var request = CreateValidRequest();

        request.Name = "  Mechanical keyboard  ";

        Assert.Equal("Mechanical keyboard", request.Name);
        Assert.True(Validate(request));
    }

    [Fact]
    public void WhitespaceDescription_BecomesNull()
    {
        var request = CreateValidRequest();

        request.Description = "   ";

        Assert.Null(request.Description);
    }

    [Fact]
    public void Description_IsTrimmed()
    {
        var request = CreateValidRequest();

        request.Description = "  Wireless keyboard  ";

        Assert.Equal("Wireless keyboard", request.Description);
        Assert.True(Validate(request));
    }

    private static ProductRequestDto CreateValidRequest()
    {
        return new ProductRequestDto
        {
            Name = "Keyboard",
            Description = "Wireless",
            Price = 89.99m,
            Stock = 12
        };
    }

    private static bool Validate(ProductRequestDto request)
    {
        var validationResults = new List<ValidationResult>();
        var validationContext = new ValidationContext(request);

        return Validator.TryValidateObject(
            request,
            validationContext,
            validationResults,
            validateAllProperties: true);
    }
}