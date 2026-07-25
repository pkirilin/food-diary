using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AwesomeAssertions;
using FoodDiary.Application.Categories.Update;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using Moq;
using Xunit;

namespace FoodDiary.UnitTests.Categories.Update;

public class UpdateCategoryCommandHandlerTests
{
    private readonly Mock<ICategoryRepository> _repository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    public UpdateCategoryCommandHandlerTests()
    {
        _repository.Setup(r => r.UnitOfWork).Returns(_unitOfWork.Object);
        _unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
    }

    private void GivenExistingCategory(Category? category)
    {
        _repository.Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(category!);
    }

    private void GivenCategoriesWithName(params Category[] categories)
    {
        _repository.Setup(r => r.GetQueryWithoutTracking()).Returns(categories.AsQueryable());
        _repository
            .Setup(r => r.GetByQueryAsync(It.IsAny<IQueryable<Category>>(), It.IsAny<CancellationToken>()))
            .Returns((IQueryable<Category> q, CancellationToken _) => Task.FromResult(q.ToList()));
    }

    [Fact]
    public async Task Handle_CategoryNotFound_ReturnsNotFound()
    {
        GivenExistingCategory(null);
        GivenCategoriesWithName();
        var handler = new UpdateCategoryCommandHandler(_repository.Object);

        var result = await handler.Handle(new UpdateCategoryCommand(1, "Dairy"), CancellationToken.None);

        result.Should().BeOfType<UpdateCategoryResult.NotFound>();
        _repository.Verify(r => r.Update(It.IsAny<Category>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NameChangedToExistingName_ReturnsNameAlreadyExists()
    {
        GivenExistingCategory(new Category { Id = 1, Name = "Dairy" });
        GivenCategoriesWithName(new Category { Id = 2, Name = "Frozen" });
        var handler = new UpdateCategoryCommandHandler(_repository.Object);

        var result = await handler.Handle(new UpdateCategoryCommand(1, "Frozen"), CancellationToken.None);

        result.Should().BeOfType<UpdateCategoryResult.NameAlreadyExists>();
        _repository.Verify(r => r.Update(It.IsAny<Category>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NameUnchanged_AllowedEvenWhenSameNameRowExists()
    {
        var existing = new Category { Id = 1, Name = "Dairy" };
        GivenExistingCategory(existing);
        GivenCategoriesWithName(new Category { Id = 1, Name = "Dairy" });
        var handler = new UpdateCategoryCommandHandler(_repository.Object);

        var result = await handler.Handle(new UpdateCategoryCommand(1, "Dairy"), CancellationToken.None);

        result.Should().BeOfType<UpdateCategoryResult.Success>();
        _repository.Verify(r => r.Update(existing), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_NameChangedToFreeName_UpdatesAndReturnsSuccess()
    {
        var existing = new Category { Id = 1, Name = "Dairy" };
        GivenExistingCategory(existing);
        GivenCategoriesWithName();
        var handler = new UpdateCategoryCommandHandler(_repository.Object);

        var result = await handler.Handle(new UpdateCategoryCommand(1, "Cheese"), CancellationToken.None);

        result.Should().BeOfType<UpdateCategoryResult.Success>();
        existing.Name.Should().Be("Cheese");
        _repository.Verify(r => r.Update(existing), Times.Once);
    }
}
