using System;
using AutoFixture;
using FluentAssertions;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using FoodDiary.Domain.Services;
using FoodDiary.Infrastructure.Services;
using FoodDiary.UnitTests.Customizations;
using Moq;
using Xunit;

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
            var expectedCategories = _fixture.CreateMany<Category>();
            _categoryRepositoryMock.Setup(r => r.GetAllAsync(default))
                .ReturnsAsync(expectedCategories);

            var result = await CategoryService.GetCategoriesAsync(default);

            _categoryRepositoryMock.Verify(r => r.GetAllAsync(default), Times.Once);
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
            _categoryRepositoryMock.Verify(r => r.SaveChangesAsync(default), Times.Once);
            result.Should().Be(category);
        }

        [Fact]
        public async void EditCategory_UpdatesCategoryWithoutErrors()
        {
            var category = _fixture.Create<Category>();
            _categoryRepositoryMock.Setup(r => r.Update(category))
                .Returns(category);

            var result = await CategoryService.EditCategoryAsync(category, default);

            _categoryRepositoryMock.Verify(r => r.Update(category), Times.Once);
            _categoryRepositoryMock.Verify(r => r.SaveChangesAsync(default), Times.Once);
            result.Should().Be(category);
        }

        [Fact]
        public async void DeleteCategory_DeletesCategoryWithoutErrors()
        {
            var category = _fixture.Create<Category>();
            _categoryRepositoryMock.Setup(r => r.Delete(category))
                .Returns(category);

            var result = await CategoryService.DeleteCategoryAsync(category, default);

            _categoryRepositoryMock.Verify(r => r.Delete(category), Times.Once);
            _categoryRepositoryMock.Verify(r => r.SaveChangesAsync(default), Times.Once);
            result.Should().Be(category);
        }

        [Fact]
        public async void CategoryCanBeCreated_ReturnsFalse_WhenCategoryHasDuplicateName()
        {
            var categoryInfo = _fixture.Create<CategoryCreateEditDto>();
            _categoryRepositoryMock.Setup(r => r.IsDuplicateAsync(categoryInfo.Name, default))
                .ReturnsAsync(true);

            var result = await CategoryService.CategoryCanBeCreatedAsync(categoryInfo, default);

            _categoryRepositoryMock.Verify(r => r.IsDuplicateAsync(categoryInfo.Name, default), Times.Once);
            result.Should().BeFalse();
        }


        [Fact]
        public async void CategoryCanBeUpdated_ReturnsFalse_WhenCategoryHasDuplicateName()
        {
            var categoryInfo = _fixture.Create<CategoryCreateEditDto>();
            var originalCategory = _fixture.Build<Category>()
                .With(c => c.Name, String.Concat(categoryInfo.Name, Guid.NewGuid()))
                .Create();
            _categoryRepositoryMock.Setup(r => r.IsDuplicateAsync(categoryInfo.Name, default))
                .ReturnsAsync(true);

            var result = await CategoryService.CategoryCanBeUpdatedAsync(categoryInfo, originalCategory, default);

            _categoryRepositoryMock.Verify(r => r.IsDuplicateAsync(categoryInfo.Name, default), Times.Once);
            result.Should().BeFalse();
        }
    }
}
