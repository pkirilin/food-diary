using System.Text.Json;
using System.Text.Json.Nodes;
using FoodDiary.API.Mcp.Tools;
using FoodDiary.API.Mcp.Tools.Products;
using FoodDiary.Application.Products.Get;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using ModelContextProtocol;
using Moq;

namespace FoodDiary.UnitTests.Mcp;

public class ProductsToolTests
{
    private static readonly Category Cereals = new() { Id = 3, Name = "Cereals" };

    private readonly Mock<IProductRepository> _productRepository = new();
    private readonly List<Product> _products = [];

    public ProductsToolTests()
    {
        _productRepository.Setup(r => r.GetQueryWithoutTracking()).Returns(() => _products.AsQueryable());
        _productRepository
            .Setup(r => r.LoadCategory(It.IsAny<IQueryable<Product>>()))
            .Returns((IQueryable<Product> query) => query);
        _productRepository
            .Setup(r => r.CountByQueryAsync(It.IsAny<IQueryable<Product>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((IQueryable<Product> query, CancellationToken _) => query.Count());
        _productRepository
            .Setup(r => r.GetByQueryAsync(It.IsAny<IQueryable<Product>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((IQueryable<Product> query, CancellationToken _) => query.ToList());
    }

    private void GivenProducts(params Product[] products)
    {
        _products.AddRange(products);
    }

    private static Product Oatmeal() => new()
    {
        Id = 42,
        Name = "Oatmeal",
        CaloriesCost = 366,
        DefaultQuantity = 60,
        CategoryId = Cereals.Id,
        Category = Cereals,
        Protein = 13.0m,
        Fats = 7.0m,
        Carbs = 62.0m,
        Sugar = null,
        Salt = null
    };

    private async Task<JsonNode> ListProducts(int pageNumber, int pageSize, string? productName = null)
    {
        var tool = new ProductsTool(new GetProductsQueryHandler(_productRepository.Object));

        var response = await tool.ListProducts(pageNumber, pageSize, productName, CancellationToken.None);

        return JsonSerializer.SerializeToNode(response, McpJsonUtilities.DefaultOptions)!;
    }

    [Fact]
    public async Task Product_CarriesCategoryDefaultQuantityAndNutritionPer100Grams()
    {
        GivenProducts(Oatmeal());

        var json = await ListProducts(pageNumber: 1, pageSize: 10);

        ShouldBeJson(json["products"]![0],
            """
            {
              "id": 42,
              "name": "Oatmeal",
              "category": { "name": "Cereals" },
              "defaultQuantity": 60,
              "per100g": {
                "calories": 366,
                "protein": 13.0,
                "fats": 7.0,
                "carbs": 62.0,
                "sugar": null,
                "salt": null
              }
            }
            """);
    }

    [Fact]
    public async Task Page_OfProductsMatchingName_CarriesPagingAndTotalCount()
    {
        GivenProducts(ProductNamed("Apple"), ProductNamed("Oatmeal"), ProductNamed("Oatcake"));

        var json = await ListProducts(pageNumber: 2, pageSize: 1, productName: "OAT");

        json["products"]!.AsArray().Select(product => product!["name"]!.GetValue<string>())
            .Should().Equal("Oatmeal");
        json["pageNumber"]!.GetValue<int>().Should().Be(2);
        json["pageSize"]!.GetValue<int>().Should().Be(1);
        json["totalCount"]!.GetValue<int>().Should().Be(2);
    }

    [Fact]
    public async Task PageSizeOf100_IsReturned()
    {
        GivenProducts(Enumerable.Range(1, 101).Select(i => ProductNamed($"Product {i:D3}")).ToArray());

        var json = await ListProducts(pageNumber: 1, pageSize: 100);

        json["products"]!.AsArray().Should().HaveCount(100);
        json["totalCount"]!.GetValue<int>().Should().Be(101);
    }

    [Fact]
    public async Task PageSizeOf101_IsToolErrorNamingLimit()
    {
        var act = () => ListProducts(pageNumber: 1, pageSize: 101);

        await act.Should().ThrowExactlyAsync<McpException>()
            .WithMessage("Requested pageSize 101; the maximum is 100. Request the next page instead.");
    }

    [Theory]
    [InlineData(0, 10, "Requested pageNumber 0; pages start at 1.")]
    [InlineData(1, 0, "Requested pageSize 0; the minimum is 1.")]
    public async Task NonPositivePaging_IsToolError(int pageNumber, int pageSize, string message)
    {
        var act = () => ListProducts(pageNumber, pageSize);

        await act.Should().ThrowExactlyAsync<McpException>().WithMessage(message);
    }

    private static Product ProductNamed(string name) => new()
    {
        Name = name,
        Category = Cereals,
        Protein = null,
        Fats = null,
        Carbs = null,
        Sugar = null,
        Salt = null
    };

    private static void ShouldBeJson(JsonNode? actual, string expectedJson)
    {
        var expected = JsonNode.Parse(expectedJson);

        JsonNode.DeepEquals(actual, expected).Should().BeTrue(
            "the actual JSON {0} should equal {1}", actual?.ToJsonString(), expected?.ToJsonString());
    }
}
