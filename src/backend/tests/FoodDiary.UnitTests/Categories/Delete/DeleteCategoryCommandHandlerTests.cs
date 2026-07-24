using System.Threading;
using System.Threading.Tasks;
using AwesomeAssertions;
using FoodDiary.Application.Categories.Delete;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using Moq;
using Xunit;

namespace FoodDiary.UnitTests.Categories.Delete;

public class DeleteCategoryCommandHandlerTests
{
    private readonly Mock<ICategoryRepository> _repository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    public DeleteCategoryCommandHandlerTests()
    {
        _repository.Setup(r => r.UnitOfWork).Returns(_unitOfWork.Object);
        _unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
    }

    [Fact]
    public async Task Handle_CategoryNotFound_ReturnsNotFound()
    {
        _repository.Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Category)null!);
        var handler = new DeleteCategoryCommandHandler(_repository.Object);

        var result = await handler.Handle(new DeleteCategoryCommand(1), CancellationToken.None);

        result.Should().BeOfType<DeleteCategoryResult.NotFound>();
        _repository.Verify(r => r.Remove(It.IsAny<Category>()), Times.Never);
    }

    [Fact]
    public async Task Handle_CategoryExists_RemovesAndReturnsSuccess()
    {
        var category = new Category { Id = 1, Name = "Dairy" };
        _repository.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(category);
        var handler = new DeleteCategoryCommandHandler(_repository.Object);

        var result = await handler.Handle(new DeleteCategoryCommand(1), CancellationToken.None);

        result.Should().BeOfType<DeleteCategoryResult.Success>();
        _repository.Verify(r => r.Remove(category), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
