using System.Net;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using FoodDiary.Contracts.Products;
using FoodDiary.IntegrationTests.Extensions;
using Xunit;

namespace FoodDiary.IntegrationTests.API;

public class ProductApiTests : IClassFixture<FoodDiaryWebApplicationFactory>
{
    private readonly FoodDiaryWebApplicationFactory _webApplicationFactory;

    public ProductApiTests(FoodDiaryWebApplicationFactory webApplicationFactory)
    {
        _webApplicationFactory = webApplicationFactory;
    }

    [Fact]
    public async Task Gets_product_dropdown_items_ordered_by_name()
    {
        await _webApplicationFactory.PrepareDatabase()
            .AddProduct(1, "Milk")
            .AddProduct(2, "Bread")
            .SeedAsync();
        
        var client = _webApplicationFactory.CreateClient();
        
        var response = await client.GetAsync("/api/v1/products/dropdown", CancellationToken.None);
        var dropdownItems = await response.Content.ReadFromJsonAsync<ProductDropdownItemDto[]>();
        
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        dropdownItems.Should().HaveCount(2);
        dropdownItems.Should().Contain(p => p.Name == "Bread");
        dropdownItems.Should().Contain(p => p.Name == "Milk");
        dropdownItems.Should().BeInAscendingOrder(p => p.Name);
    }
}