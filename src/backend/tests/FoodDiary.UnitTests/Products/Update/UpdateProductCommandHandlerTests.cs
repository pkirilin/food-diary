using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AwesomeAssertions;
using FoodDiary.Application.Products.Update;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using Moq;
using Xunit;

namespace FoodDiary.UnitTests.Products.Update;

public class UpdateProductCommandHandlerTests
{
    private readonly Mock<IProductRepository> _repository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    public UpdateProductCommandHandlerTests()
    {
        _repository.Setup(r => r.UnitOfWork).Returns(_unitOfWork.Object);
        _unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
    }

    private static Product NewProduct(int id, string name) =>
        new() { Id = id, Name = name, Protein = null, Fats = null, Carbs = null, Sugar = null, Salt = null };

    private static UpdateProductCommand Command(int id, string name) =>
        new(id, name, 100, 100, 1, null, null, null, null, null);

    private void GivenExistingProduct(Product? product) =>
        _repository.Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>())).ReturnsAsync(product!);

    private void GivenProductsWithName(params Product[] products)
    {
        _repository.Setup(r => r.GetQueryWithoutTracking()).Returns(products.AsQueryable());
        _repository
            .Setup(r => r.GetByQueryAsync(It.IsAny<IQueryable<Product>>(), It.IsAny<CancellationToken>()))
            .Returns((IQueryable<Product> q, CancellationToken _) => Task.FromResult(q.ToList()));
    }

    [Fact]
    public async Task Handle_ProductNotFound_ReturnsNotFound()
    {
        GivenExistingProduct(null);
        GivenProductsWithName();
        var handler = new UpdateProductCommandHandler(_repository.Object);

        var result = await handler.Handle(Command(1, "Beef"), CancellationToken.None);

        result.Should().BeOfType<UpdateProductResult.NotFound>();
        _repository.Verify(r => r.Update(It.IsAny<Product>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NameChangedToExistingName_ReturnsNameAlreadyExists()
    {
        GivenExistingProduct(NewProduct(1, "Chicken"));
        GivenProductsWithName(NewProduct(2, "Beef"));
        var handler = new UpdateProductCommandHandler(_repository.Object);

        var result = await handler.Handle(Command(1, "Beef"), CancellationToken.None);

        result.Should().BeOfType<UpdateProductResult.NameAlreadyExists>();
        _repository.Verify(r => r.Update(It.IsAny<Product>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NameUnchanged_AllowedEvenWhenSameNameRowExists()
    {
        var existing = NewProduct(1, "Chicken");
        GivenExistingProduct(existing);
        GivenProductsWithName(NewProduct(1, "Chicken"));
        var handler = new UpdateProductCommandHandler(_repository.Object);

        var result = await handler.Handle(Command(1, "Chicken"), CancellationToken.None);

        result.Should().BeOfType<UpdateProductResult.Success>();
        _repository.Verify(r => r.Update(existing), Times.Once);
    }

    [Fact]
    public async Task Handle_NameChangedToFreeName_AssignsFieldsAndReturnsSuccess()
    {
        var existing = NewProduct(1, "Chicken");
        GivenExistingProduct(existing);
        GivenProductsWithName();
        var handler = new UpdateProductCommandHandler(_repository.Object);

        var result = await handler.Handle(
            new UpdateProductCommand(1, "Boiled chicken", 200, 150, 3, 1.1m, 2.2m, 3.3m, 4.4m, 5.5m),
            CancellationToken.None);

        result.Should().BeOfType<UpdateProductResult.Success>();
        existing.Name.Should().Be("Boiled chicken");
        existing.CaloriesCost.Should().Be(200);
        existing.CategoryId.Should().Be(3);
        existing.Protein.Should().Be(1.1m);
        existing.Salt.Should().Be(5.5m);
        _repository.Verify(r => r.Update(existing), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
