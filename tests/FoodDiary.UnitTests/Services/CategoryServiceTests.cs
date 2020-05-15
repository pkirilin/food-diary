using System.Linq;
using AutoFixture;
using AutoFixture.Xunit2;
using FluentAssertions;
using FoodDiary.API.Services;
using FoodDiary.API.Services.Implementation;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using FoodDiary.UnitTests.Customizations;
using Moq;
using Xunit;
using FoodDiary.API.Requests;

namespace FoodDiary.UnitTests.Services
{
    public class CategoryServiceTests
    {
        private readonly Mock<ICategoryRepository> _categoryRepositoryMock;

        private readonly IFixture _fixture;

        public CategoryServiceTests()
        {
            _categoryRepositoryMock = new Mock<ICategoryRepository>();
            _fixture = SetupFixture();

            _categoryRepositoryMock.SetupGet(r => r.UnitOfWork)
                .Returns(new Mock<IUnitOfWork>().Object);
        }

        public ICategoryService CategoryService => new CategoryService(_categoryRepositoryMock.Object);

        private IFixture SetupFixture()
        {
            var _fixture = new Fixture();
            _fixture.Customize(new FixtureWithCircularReferencesCustomization());
            return _fixture;
        }

        [Fact]
        public async void GetCategories_ReturnsAllCategories()
        {
            var expectedCategories = _fixture.CreateMany<Category>().ToList();
            _categoryRepositoryMock.Setup(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Category>>(), default))
                .ReturnsAsync(expectedCategories);

            var result = await CategoryService.GetCategoriesAsync(default);

            _categoryRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _categoryRepositoryMock.Verify(r => r.LoadProducts(It.IsNotNull<IQueryable<Category>>()), Times.Once);
            _categoryRepositoryMock.Verify(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Category>>(), default), Times.Once);
            result.Should().Contain(expectedCategories);
        }

        [Fact]
        public async void GetCategoryById_ReturnsRequestedCategory()
        {
            var expectedCategory = _fixture.Create<Category>();
            _categoryRepositoryMock.Setup(r => r.GetByIdAsync(expectedCategory.Id, default))
                .ReturnsAsync(expectedCategory);

            var result = await CategoryService.GetCategoryByIdAsync(expectedCategory.Id, default);

            _categoryRepositoryMock.Verify(r => r.GetByIdAsync(expectedCategory.Id, default), Times.Once);
            result.Should().Be(expectedCategory);
        }

        [Fact]
        public async void CreateCategory_CreatesCategoryWithoutErrors()
        {
            var category = _fixture.Create<Category>();
            _categoryRepositoryMock.Setup(r => r.Create(category))
                .Returns(category);

            var result = await CategoryService.CreateCategoryAsync(category, default);

            _categoryRepositoryMock.Verify(r => r.Create(category), Times.Once);
            _categoryRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
            result.Should().Be(category);
        }

        [Fact]
        public async void EditCategory_UpdatesCategoryWithoutErrors()
        {
            var category = _fixture.Create<Category>();

            await CategoryService.EditCategoryAsync(category, default);

            _categoryRepositoryMock.Verify(r => r.Update(category), Times.Once);
            _categoryRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Fact]
        public async void DeleteCategory_DeletesCategoryWithoutErrors()
        {
            var category = _fixture.Create<Category>();

            await CategoryService.DeleteCategoryAsync(category, default);

            _categoryRepositoryMock.Verify(r => r.Delete(category), Times.Once);
            _categoryRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Fact]
        public async void IsCategoryExists_ReturnsTrue_WhenCategoryHasDuplicateName()
        {
            var categoryInfo = _fixture.Create<CategoryCreateEditRequest>();
            var categoriesWithTheSameName = _fixture.CreateMany<Category>().ToList();
            _categoryRepositoryMock.Setup(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Category>>(), default))
                .ReturnsAsync(categoriesWithTheSameName);

            var result = await CategoryService.IsCategoryExistsAsync(categoryInfo.Name, default);

            _categoryRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _categoryRepositoryMock.Verify(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Category>>(), default), Times.Once);
            result.Should().BeTrue();
        }


        [Theory]
        [InlineData("Some name", "Some new name", false)]
        [InlineData("Some name", "Some name", true)]
        public void IsEditedCategoryValid_ReturnsTrue_WhenCategoryIsValidAfterItWasEdited(
            string oldCategoryName,
            string newCategoryName,
            bool isCategoryExists)
        {
            var originalCategory = _fixture.Build<Category>()
                .With(c => c.Name, oldCategoryName)
                .Create();
            var editedCategoryData = _fixture.Build<CategoryCreateEditRequest>()
                .With(c => c.Name, newCategoryName)
                .Create();

            var result = CategoryService.IsEditedCategoryValid(editedCategoryData, originalCategory, isCategoryExists);

            result.Should().BeTrue();
        }

        [Theory]
        [InlineAutoData(null)]
        [InlineAutoData("")]
        [InlineAutoData("  ")]
        [InlineAutoData("some name")]
        public async void GetCategoriesDropdown_ReturnsAllCategories(string categoryFilterName)
        {
            var request = _fixture.Build<CategoryDropdownSearchRequest>()
                .With(r => r.CategoryNameFilter, categoryFilterName)
                .Create();
            var expectedCategories = _fixture.CreateMany<Category>().ToList();
            _categoryRepositoryMock.Setup(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Category>>(), default))
                .ReturnsAsync(expectedCategories);

            var result = await CategoryService.GetCategoriesDropdownAsync(request, default);

            _categoryRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _categoryRepositoryMock.Verify(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Category>>(), default), Times.Once);
            result.Should().Contain(expectedCategories);
        }
    }
}
