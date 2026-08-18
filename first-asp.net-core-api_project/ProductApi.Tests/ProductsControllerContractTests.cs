using System.Reflection;
using Microsoft.AspNetCore.Mvc;
using ProductApi.Controllers;
using ProductApi.Models;

namespace ProductApi.Tests;

public sealed class ProductsControllerContractTests
{
    [Fact]
    public void Actions_DoNotExposeProductEntity()
    {
        var actions = typeof(ProductsController)
            .GetMethods(BindingFlags.Instance | BindingFlags.Public)
            .Where(method =>
                method.DeclaringType == typeof(ProductsController));

        foreach (var action in actions)
        {
            Assert.False(
                ContainsProductEntity(action.ReturnType),
                $"{action.Name} exposes Product in its return type.");

            Assert.DoesNotContain(
                action.GetParameters(),
                parameter => ContainsProductEntity(parameter.ParameterType));

            var responseTypes =
                action.GetCustomAttributes<ProducesResponseTypeAttribute>();

            foreach (var responseType in responseTypes)
            {
                Assert.False(
                    ContainsProductEntity(responseType.Type),
                    $"{action.Name} exposes Product in OpenAPI metadata.");
            }
        }
    }

    private static bool ContainsProductEntity(Type? type)
    {
        if (type is null)
        {
            return false;
        }

        if (type == typeof(Product))
        {
            return true;
        }

        return type.IsGenericType &&
               type.GetGenericArguments().Any(ContainsProductEntity);
    }
}