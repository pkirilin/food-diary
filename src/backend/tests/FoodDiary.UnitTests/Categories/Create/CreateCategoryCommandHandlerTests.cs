using FoodDiary.Application.Categories.Create;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using Moq;

namespace FoodDiary.UnitTests.Categories.Create;

public class CreateCategoryCommandHandlerTests
{
    private readonly Mock<ICategoryRepository> _repository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    public CreateCategoryCommandHandlerTests()
    {
        _repository.Setup(r => r.UnitOfWork).Returns(_unitOfWork.Object);
        _unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
    }

    private void GivenCategories(params Category[] categories)
    {
        _repository.Setup(r => r.GetQueryWithoutTracking()).Returns(categories.AsQueryable());
        _repository
            .Setup(r => r.GetByQueryAsync(It.IsAny<IQueryable<Category>>(), It.IsAny<CancellationToken>()))
            .Returns((IQueryable<Category> q, CancellationToken _) => Task.FromResult(q.ToList()));
    }

    [Fact]
    public async Task Handle_NameAlreadyExists_ReturnsNameAlreadyExists()
    {
        GivenCategories(new Category { Name = "Dairy" });
        var handler = new CreateCategoryCommandHandler(_repository.Object);

        var result = await handler.Handle(new CreateCategoryCommand("Dairy"), CancellationToken.None);

        result.Should().BeOfType<CreateCategoryResult.NameAlreadyExists>();
        _repository.Verify(r => r.Add(It.IsAny<Category>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NewName_AddsAndReturnsSuccess()
    {
        GivenCategories();
        _repository.Setup(r => r.Add(It.IsAny<Category>())).Returns((Category c) => c);
        var handler = new CreateCategoryCommandHandler(_repository.Object);

        var result = await handler.Handle(new CreateCategoryCommand("Dairy"), CancellationToken.None);

        result.Should().BeOfType<CreateCategoryResult.Success>()
            .Which.Category.Name.Should().Be("Dairy");
        _repository.Verify(r => r.Add(It.Is<Category>(c => c.Name == "Dairy")), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
