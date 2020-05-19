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
using FoodDiary.UnitTests.Services.TestData;

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

        public ICategoryService Sut => new CategoryService(_categoryRepositoryMock.Object);

        [Theory]
        [MemberData(nameof(CategoryServiceTestData.GetCategories), MemberType = typeof(CategoryServiceTestData))]
        public async void GetCategories_ReturnsAllCategoriesOrderedByName(
            List<Category> sourceCategories,
            List<Category> categoriesOrderedByName)
        {
            var sourceCategoriesQuery = sourceCategories.AsQueryable();
            var categoriesOrderedByNameQuery = categoriesOrderedByName.AsQueryable();

            _categoryRepositoryMock.Setup(r => r.GetQueryWithoutTracking())
                .Returns(sourceCategoriesQuery);

            _categoryRepositoryMock.Setup(r => r.LoadProducts(sourceCategoriesQuery))
                .Returns(sourceCategoriesQuery);

            _categoryRepositoryMock.Setup(r => r.GetListFromQueryAsync(categoriesOrderedByNameQuery, default))
                .ReturnsAsync(categoriesOrderedByName);

            var result = await Sut.GetCategoriesAsync(default);

            _categoryRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _categoryRepositoryMock.Verify(r => r.LoadProducts(sourceCategoriesQuery), Times.Once);
            _categoryRepositoryMock.Verify(r => r.GetListFromQueryAsync(categoriesOrderedByNameQuery, default), Times.Once);
            
            result.Should().ContainInOrder(categoriesOrderedByName);
        }

        [Theory]
        [CustomAutoData]
        public async void GetCategoryById_ReturnsRequestedCategory(
            int requestedCategoryId, Category requestedCategory)
        {
            _categoryRepositoryMock.Setup(r => r.GetByIdAsync(requestedCategoryId, default))
                .ReturnsAsync(requestedCategory);

            var result = await Sut.GetCategoryByIdAsync(requestedCategoryId, default);

            _categoryRepositoryMock.Verify(r => r.GetByIdAsync(requestedCategoryId, default), Times.Once);

            result.Should().Be(requestedCategory);
        }

        [Theory]
        [CustomAutoData]
        public async void CreateCategory_CreatesCategory(Category category)
        {
            _categoryRepositoryMock.Setup(r => r.Create(category))
                .Returns(category);

            var result = await Sut.CreateCategoryAsync(category, default);

            _categoryRepositoryMock.Verify(r => r.Create(category), Times.Once);
            _categoryRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
            
            result.Should().Be(category);
        }

        [Theory]
        [CustomAutoData]
        public async void EditCategory_UpdatesCategory(Category category)
        {
            await Sut.EditCategoryAsync(category, default);

            _categoryRepositoryMock.Verify(r => r.Update(category), Times.Once);
            _categoryRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Theory]
        [CustomAutoData]
        public async void DeleteCategory_DeletesCategory(Category category)
        {
            await Sut.DeleteCategoryAsync(category, default);

            _categoryRepositoryMock.Verify(r => r.Delete(category), Times.Once);
            _categoryRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Theory]
        [MemberData(nameof(CategoryServiceTestData.IsCategoryExists), MemberType = typeof(CategoryServiceTestData))]
        public async void IsCategoryExists_ReturnsTrue_WhenCategoryHasDuplicateName(
            string categorySearchName,
            List<Category> sourceCategories,
            List<Category> categoriesWithTheSameName,
            bool expectedResult)
        {
            var categoriesWithTheSameNameQuery = categoriesWithTheSameName.AsQueryable();

            _categoryRepositoryMock.Setup(r => r.GetQueryWithoutTracking())
                .Returns(sourceCategories.AsQueryable());

            _categoryRepositoryMock.Setup(r => r.GetListFromQueryAsync(categoriesWithTheSameNameQuery, default))
                .ReturnsAsync(categoriesWithTheSameName);

            var result = await Sut.IsCategoryExistsAsync(categorySearchName, default);

            _categoryRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _categoryRepositoryMock.Verify(r => r.GetListFromQueryAsync(categoriesWithTheSameNameQuery, default), Times.Once);

            result.Should().Be(expectedResult);
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

            var result = Sut.IsEditedCategoryValid(editedCategoryData, originalCategory, isCategoryExists);

            result.Should().BeTrue();
        }

        [Theory]
        [MemberData(nameof(CategoryServiceTestData.GetCategoriesDropdown), MemberType = typeof(CategoryServiceTestData))]
        public async void GetCategoriesDropdown_ReturnsCategories(
            CategoryDropdownSearchRequest request,
            List<Category> sourceCategories,
            List<Category> foundCategories)
        {
            var foundCategoriesQuery = foundCategories.AsQueryable();

            _categoryRepositoryMock.Setup(r => r.GetQueryWithoutTracking())
                .Returns(sourceCategories.AsQueryable());

            _categoryRepositoryMock.Setup(r => r.GetListFromQueryAsync(foundCategoriesQuery, default))
                .ReturnsAsync(foundCategories);

            var result = await Sut.GetCategoriesDropdownAsync(request, default);

            _categoryRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _categoryRepositoryMock.Verify(r => r.GetListFromQueryAsync(foundCategoriesQuery, default), Times.Once);
            
            result.Should().ContainInOrder(foundCategories);
        }
    }
}
