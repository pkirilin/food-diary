using FluentAssertions;
using FoodDiary.Application.Notes.Recognize;
using Xunit;

namespace FoodDiary.UnitTests.Notes.Recognize;

public class MappingExtensionsTests
{
    [Fact]
    public void ToRecognizeNoteItem_AllFieldsPopulated_MapsAndRoundsCalories()
    {
        var product = new RecognizedProduct(
            Name: "Bread",
            Quantity: 200,
            Calories: 257.6m,
            BrandName: "Acme",
            Protein: 8.123m,
            Fats: 2.5m,
            Carbs: 48.456m,
            Sugar: 3.2m,
            Salt: 0.5m);

        var result = product.ToRecognizeNoteItem();

        result.Quantity.Should().Be(200);
        result.Product.Name.Should().Be("Bread (Acme)");
        result.Product.CaloriesCost.Should().Be(258);
        result.Product.Protein.Should().Be(8.12m);
        result.Product.Fats.Should().Be(2.50m);
        result.Product.Carbs.Should().Be(48.46m);
        result.Product.Sugar.Should().Be(3.20m);
        result.Product.Salt.Should().Be(0.50m);
    }

    [Fact]
    public void ToRecognizeNoteItem_OnlyName_AppliesDefaults()
    {
        var product = new RecognizedProduct(Name: "Apple");

        var result = product.ToRecognizeNoteItem();

        result.Quantity.Should().Be(100);
        result.Product.Name.Should().Be("Apple");
        result.Product.CaloriesCost.Should().Be(100);
        result.Product.Protein.Should().BeNull();
        result.Product.Fats.Should().BeNull();
        result.Product.Carbs.Should().BeNull();
        result.Product.Sugar.Should().BeNull();
        result.Product.Salt.Should().BeNull();
    }

    [Fact]
    public void ToRecognizeNoteItem_BlankBrandName_OmitsBrandSuffix()
    {
        var product = new RecognizedProduct(Name: "Apple", BrandName: "   ");

        var result = product.ToRecognizeNoteItem();

        result.Product.Name.Should().Be("Apple");
    }

    [Fact]
    public void ToRecognizeNoteItem_FractionalCaloriesHalfwayUp_RoundsAwayFromZero()
    {
        var product = new RecognizedProduct(Name: "X", Calories: 0.5m);

        var result = product.ToRecognizeNoteItem();

        result.Product.CaloriesCost.Should().Be(1);
    }
}
