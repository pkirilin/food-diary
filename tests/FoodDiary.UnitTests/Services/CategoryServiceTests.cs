using System.Linq;
using AutoFixture;
using FluentAssertions;
using FoodDiary.API.Services;
using FoodDiary.API.Services.Implementation;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using Moq;
using Xunit;
using FoodDiary.API.Requests;
using System.Collections.Generic;
using FoodDiary.UnitTests.Attributes;

namespace FoodDiary.UnitTests.Services
{
    public class CategoryServiceTests
    {
        private readonly Mock<ICategoryRepository> _categoryRepositoryMock;

        private readonly IFixture _fixture = Fixtures.Custom;

        public CategoryServiceTests()
        {
            _categoryRepositoryMock = new Mock<ICategoryRepository>();
            _categoryRepositoryMock.SetupGet(r => r.UnitOfWork)
                .Returns(new Mock<IUnitOfWork>().Object);
        }

        public ICategoryService CategoryService => new CategoryService(_categoryRepositoryMock.Object);

        [Theory]
        [CustomAutoData]
        public async void GetCategories_ReturnsAllCategoriesOrderedByName(
            List<Category> foundCategories)
        {
            _categoryRepositoryMock.Setup(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Category>>(), default))
                .ReturnsAsync(foundCategories);

            var result = await CategoryService.GetCategoriesAsync(default);

            _categoryRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _categoryRepositoryMock.Verify(r => r.LoadProducts(It.IsNotNull<IQueryable<Category>>()), Times.Once);
            _categoryRepositoryMock.Verify(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Category>>(), default), Times.Once);
            
            result.Should().Contain(foundCategories);
        }

        [Theory]
        [CustomAutoData]
        public async void GetCategoryById_ReturnsRequestedCategory(
            int requestedCategoryId, Category requestedCategory)
        {
            _categoryRepositoryMock.Setup(r => r.GetByIdAsync(requestedCategoryId, default))
                .ReturnsAsync(requestedCategory);

            var result = await CategoryService.GetCategoryByIdAsync(requestedCategoryId, default);

            _categoryRepositoryMock.Verify(r => r.GetByIdAsync(requestedCategoryId, default), Times.Once);

            result.Should().Be(requestedCategory);
        }

        [Theory]
        [CustomAutoData]
        public async void CreateCategory_CreatesCategory(Category category)
        {
            _categoryRepositoryMock.Setup(r => r.Create(category))
                .Returns(category);

            var result = await CategoryService.CreateCategoryAsync(category, default);

            _categoryRepositoryMock.Verify(r => r.Create(category), Times.Once);
            _categoryRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
            
            result.Should().Be(category);
        }

        [Theory]
        [CustomAutoData]
        public async void EditCategory_UpdatesCategory(Category category)
        {
            await CategoryService.EditCategoryAsync(category, default);

            _categoryRepositoryMock.Verify(r => r.Update(category), Times.Once);
            _categoryRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Theory]
        [CustomAutoData]
        public async void DeleteCategory_DeletesCategory(Category category)
        {
            await CategoryService.DeleteCategoryAsync(category, default);

            _categoryRepositoryMock.Verify(r => r.Delete(category), Times.Once);
            _categoryRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Theory]
        [CustomAutoData]
        public async void IsCategoryExists_ReturnsTrue_WhenCategoryHasDuplicateName(
            string categorySearchName, List<Category> categoriesWithTheSameName)
        {
            _categoryRepositoryMock.Setup(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Category>>(), default))
                .ReturnsAsync(categoriesWithTheSameName);

            var result = await CategoryService.IsCategoryExistsAsync(categorySearchName, default);

            _categoryRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _categoryRepositoryMock.Verify(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Category>>(), default), Times.Once);

            result.Should().BeTrue();
        }


        [Theory]
        [InlineData("Some name", "Some new name", false)]
        [InlineData("Some name", "Some name", true)]
        public void IsEditedCategoryValid_ReturnsTrue_WhenCategoryIsValidAfterItWasEdited(
            string oldCategoryName, string newCategoryName, bool isCategoryExists)
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
        [CustomAutoData]
        public async void GetCategoriesDropdown_ReturnsCategories(
            CategoryDropdownSearchRequest request, List<Category> categories)
        {
            _categoryRepositoryMock.Setup(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Category>>(), default))
                .ReturnsAsync(categories);

            var result = await CategoryService.GetCategoriesDropdownAsync(request, default);

            _categoryRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _categoryRepositoryMock.Verify(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Category>>(), default), Times.Once);
            
            result.Should().Contain(categories);
        }
    }
}
