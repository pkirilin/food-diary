using FoodDiary.Application.Products.Delete;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using Moq;

namespace FoodDiary.UnitTests.Products.Delete;

public class DeleteProductCommandHandlerTests
{
    private readonly Mock<IProductRepository> _repository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    public DeleteProductCommandHandlerTests()
    {
        _repository.Setup(r => r.UnitOfWork).Returns(_unitOfWork.Object);
        _unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
    }

    [Fact]
    public async Task Handle_ProductNotFound_ReturnsNotFound()
    {
        _repository.Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Product)null!);
        var handler = new DeleteProductCommandHandler(_repository.Object);

        var result = await handler.Handle(new DeleteProductCommand(1), CancellationToken.None);

        result.Should().BeOfType<DeleteProductResult.NotFound>();
        _repository.Verify(r => r.Remove(It.IsAny<Product>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ProductExists_RemovesAndReturnsSuccess()
    {
        var product = new Product { Id = 1, Name = "Milk", Protein = null, Fats = null, Carbs = null, Sugar = null, Salt = null };
        _repository.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(product);
        var handler = new DeleteProductCommandHandler(_repository.Object);

        var result = await handler.Handle(new DeleteProductCommand(1), CancellationToken.None);

        result.Should().BeOfType<DeleteProductResult.Success>();
        _repository.Verify(r => r.Remove(product), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
