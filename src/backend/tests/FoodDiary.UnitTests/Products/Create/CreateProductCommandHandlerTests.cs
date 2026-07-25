using FoodDiary.Application.Products.Create;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories.v2;
using Moq;

namespace FoodDiary.UnitTests.Products.Create;

public class CreateProductCommandHandlerTests
{
    private readonly Mock<IProductsRepository> _repository = new();

    private static CreateProductCommand Command(string name = "Chicken") =>
        new(name, 100, 100, 1, null, null, null, null, null);

    [Fact]
    public async Task Handle_ProductWithSameNameExists_ReturnsProductAlreadyExists()
    {
        _repository.Setup(r => r.FindByExactName("Chicken", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Product { Name = "Chicken", Protein = null, Fats = null, Carbs = null, Sugar = null, Salt = null });
        var handler = new CreateProductCommandHandler(_repository.Object);

        var result = await handler.Handle(Command(), CancellationToken.None);

        result.Should().BeOfType<CreateProductResult.ProductAlreadyExists>();
        _repository.Verify(r => r.Create(It.IsAny<Product>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NewName_CreatesAndReturnsSuccess()
    {
        _repository.Setup(r => r.FindByExactName("Chicken", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Product)null!);
        var handler = new CreateProductCommandHandler(_repository.Object);

        var result = await handler.Handle(Command(), CancellationToken.None);

        result.Should().BeOfType<CreateProductResult.Success>()
            .Which.Product.Name.Should().Be("Chicken");
        _repository.Verify(r => r.Create(It.Is<Product>(p => p.Name == "Chicken"), It.IsAny<CancellationToken>()), Times.Once);
    }
}
