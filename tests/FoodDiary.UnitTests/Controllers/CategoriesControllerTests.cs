using System.Collections.Generic;
using System.Reflection;
using AutoMapper;
using FluentAssertions;
using FoodDiary.API;
using FoodDiary.API.Controllers.v1;
using FoodDiary.API.Requests;
using FoodDiary.API.Services;
using FoodDiary.Domain.Entities;
using FoodDiary.UnitTests.Attributes;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Xunit;

namespace FoodDiary.UnitTests.Controllers
{
    public class CategoriesControllerTests
    {
        private readonly IMapper _mapper;

        private readonly Mock<ICategoryService> _categoryServiceMock;

        public CategoriesControllerTests()
        {
            var serviceProvider = new ServiceCollection()
                .AddAutoMapper(Assembly.GetAssembly(typeof(AutoMapperProfile)))
                .BuildServiceProvider();

            _mapper = serviceProvider.GetService<IMapper>();
            _categoryServiceMock = new Mock<ICategoryService>();
        }

        public CategoriesController Sut => new CategoriesController(_mapper, _categoryServiceMock.Object);

        [Theory]
        [CustomAutoData]
        public async void GetCategories_ReturnsRequestedCategories(IEnumerable<Category> categories)
        {
            _categoryServiceMock.Setup(s => s.GetCategoriesAsync(default))
                .ReturnsAsync(categories);

            var result = await Sut.GetCategories(default);

            _categoryServiceMock.Verify(s => s.GetCategoriesAsync(default), Times.Once);
            result.Should().BeOfType<OkObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void CreateCategory_ReturnsOk_WhenCategoryWithTheSameNameDoesNotExist(
            CategoryCreateEditRequest categoryData, Category createdCategory)
        {
            _categoryServiceMock.Setup(s => s.IsCategoryExistsAsync(categoryData.Name, default))
                .ReturnsAsync(false);

            _categoryServiceMock.Setup(s => s.CreateCategoryAsync(It.IsNotNull<Category>(), default))
                .ReturnsAsync(createdCategory);

            var result = await Sut.CreateCategory(categoryData, default);

            _categoryServiceMock.Verify(s => s.IsCategoryExistsAsync(categoryData.Name, default), Times.Once);
            _categoryServiceMock.Verify(s => s.CreateCategoryAsync(It.IsNotNull<Category>(), default), Times.Once);
            
            result.Should().BeOfType<OkObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void CreateCategory_ReturnsBadRequest_WhenModelStateIsInvalid(
            CategoryCreateEditRequest categoryData, string errorMessage)
        {
            var controller = Sut;
            controller.ModelState.AddModelError(errorMessage, errorMessage);

            var result = await controller.CreateCategory(categoryData, default);

            _categoryServiceMock.Verify(s => s.IsCategoryExistsAsync(categoryData.Name, default), Times.Never);
            _categoryServiceMock.Verify(s => s.CreateCategoryAsync(It.IsNotNull<Category>(), default), Times.Never);
            
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void CreateCategory_ReturnsBadRequest_WhenCategoryWithTheSameNameAlreadyExists(
            CategoryCreateEditRequest categoryData)
        {
            _categoryServiceMock.Setup(s => s.IsCategoryExistsAsync(categoryData.Name, default))
                .ReturnsAsync(true);

            var result = await Sut.CreateCategory(categoryData, default);

            _categoryServiceMock.Verify(s => s.IsCategoryExistsAsync(categoryData.Name, default), Times.Once);
            _categoryServiceMock.Verify(s => s.CreateCategoryAsync(It.IsNotNull<Category>(), default), Times.Never);
            
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void EditCategory_UpdatesCategory_WhenEditedCategoryIsValid(
            int categoryId, CategoryCreateEditRequest updatedCategoryData, Category originalCategory)
        {
            _categoryServiceMock.Setup(s => s.GetCategoryByIdAsync(categoryId, default))
                .ReturnsAsync(originalCategory);

            _categoryServiceMock.Setup(s => s.IsCategoryExistsAsync(updatedCategoryData.Name, default))
                .ReturnsAsync(false);

            _categoryServiceMock.Setup(s => s.IsEditedCategoryValid(updatedCategoryData, originalCategory, false))
                .Returns(true);

            var result = await Sut.EditCategory(categoryId, updatedCategoryData, default);

            _categoryServiceMock.Verify(s => s.GetCategoryByIdAsync(categoryId, default), Times.Once);
            _categoryServiceMock.Verify(s => s.IsCategoryExistsAsync(updatedCategoryData.Name, default), Times.Once);
            _categoryServiceMock.Verify(s => s.IsEditedCategoryValid(updatedCategoryData, originalCategory, false), Times.Once);
            _categoryServiceMock.Verify(s => s.EditCategoryAsync(It.IsNotNull<Category>(), default), Times.Once);
            
            result.Should().BeOfType<OkResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void EditCategory_ReturnsBadRequest_WhenModelStateIsInvalid(
            int categoryId, CategoryCreateEditRequest updatedCategoryData, string errorMessage)
        {
            var controller = Sut;
            controller.ModelState.AddModelError(errorMessage, errorMessage);

            var result = await controller.EditCategory(categoryId, updatedCategoryData, default);

            _categoryServiceMock.Verify(s => s.GetCategoryByIdAsync(categoryId, default), Times.Never);
            _categoryServiceMock.Verify(s => s.IsCategoryExistsAsync(updatedCategoryData.Name, default), Times.Never);
            _categoryServiceMock.Verify(s => s.IsEditedCategoryValid(updatedCategoryData, It.IsAny<Category>(), It.IsAny<bool>()), Times.Never);
            _categoryServiceMock.Verify(s => s.EditCategoryAsync(It.IsNotNull<Category>(), default), Times.Never);
            
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void EditCategory_ReturnsNotFound_WhenCategoryForUpdateDoesNotExist(
            int categoryId, CategoryCreateEditRequest updatedCategoryData)
        {
            _categoryServiceMock.Setup(s => s.GetCategoryByIdAsync(categoryId, default))
                .ReturnsAsync(null as Category);

            var result = await Sut.EditCategory(categoryId, updatedCategoryData, default);

            _categoryServiceMock.Verify(s => s.GetCategoryByIdAsync(categoryId, default), Times.Once);
            _categoryServiceMock.Verify(s => s.IsCategoryExistsAsync(updatedCategoryData.Name, default), Times.Never);
            _categoryServiceMock.Verify(s => s.IsEditedCategoryValid(updatedCategoryData, It.IsAny<Category>(), It.IsAny<bool>()), Times.Never);
            _categoryServiceMock.Verify(s => s.EditCategoryAsync(It.IsNotNull<Category>(), default), Times.Never);
            
            result.Should().BeOfType<NotFoundResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void EditCategory_ReturnsBadRequest_WhenEditedCategoryIsInvalid(
            int categoryId, CategoryCreateEditRequest updatedCategoryData, Category originalCategory)
        {
            _categoryServiceMock.Setup(s => s.GetCategoryByIdAsync(categoryId, default))
                .ReturnsAsync(originalCategory);

            _categoryServiceMock.Setup(s => s.IsCategoryExistsAsync(updatedCategoryData.Name, default))
                .ReturnsAsync(false);

            _categoryServiceMock.Setup(s => s.IsEditedCategoryValid(updatedCategoryData, originalCategory, false))
                .Returns(false);

            var result = await Sut.EditCategory(categoryId, updatedCategoryData, default);

            _categoryServiceMock.Verify(s => s.GetCategoryByIdAsync(categoryId, default), Times.Once);
            _categoryServiceMock.Verify(s => s.IsCategoryExistsAsync(updatedCategoryData.Name, default), Times.Once);
            _categoryServiceMock.Verify(s => s.IsEditedCategoryValid(updatedCategoryData, originalCategory, false), Times.Once);
            _categoryServiceMock.Verify(s => s.EditCategoryAsync(It.IsNotNull<Category>(), default), Times.Never);
            
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void DeleteCategory_DeletesCategory_WhenCategoryForDeleteExists(
            int categoryId, Category categoryForDelete)
        {
            _categoryServiceMock.Setup(s => s.GetCategoryByIdAsync(categoryId, default))
                .ReturnsAsync(categoryForDelete);

            var result = await Sut.DeleteCategory(categoryId, default);

            _categoryServiceMock.Verify(s => s.GetCategoryByIdAsync(categoryId, default), Times.Once);
            _categoryServiceMock.Verify(s => s.DeleteCategoryAsync(categoryForDelete, default), Times.Once);
            
            result.Should().BeOfType<OkResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void DeleteCategory_ReturnsNotFound_WhenCategoryForDeleteDoesNotExist(
            int categoryId)
        {
            _categoryServiceMock.Setup(s => s.GetCategoryByIdAsync(categoryId, default))
                .ReturnsAsync(null as Category);

            var result = await Sut.DeleteCategory(categoryId, default);

            _categoryServiceMock.Verify(s => s.GetCategoryByIdAsync(categoryId, default), Times.Once);
            _categoryServiceMock.Verify(s => s.DeleteCategoryAsync(It.IsAny<Category>(), default), Times.Never);
            
            result.Should().BeOfType<NotFoundResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void GetCategoriesDropdown_ReturnsRequestedCategories(
            CategoryDropdownSearchRequest request, IEnumerable<Category> categories)
        {
            _categoryServiceMock.Setup(s => s.GetCategoriesDropdownAsync(request, default))
                .ReturnsAsync(categories);

            var result = await Sut.GetCategoriesDropdown(request, default);

            _categoryServiceMock.Verify(s => s.GetCategoriesDropdownAsync(request, default), Times.Once);
            
            result.Should().BeOfType<OkObjectResult>();
        }
    }
}
