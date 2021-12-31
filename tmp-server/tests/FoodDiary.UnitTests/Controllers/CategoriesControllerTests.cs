using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using AutoFixture;
using AutoMapper;
using FluentAssertions;
using FoodDiary.API;
using FoodDiary.API.Controllers.v1;
using FoodDiary.API.Requests;
using FoodDiary.Application.Categories.Requests;
using FoodDiary.Domain.Entities;
using FoodDiary.UnitTests.Attributes;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Xunit;

namespace FoodDiary.UnitTests.Controllers
{
    public class CategoriesControllerTests
    {
        private readonly IMapper _mapper;
        private readonly Mock<IMediator> _mediatorMock = new Mock<IMediator>();

        public CategoriesControllerTests()
        {
            var serviceProvider = new ServiceCollection()
                .AddAutoMapper(Assembly.GetAssembly(typeof(AutoMapperProfile)))
                .BuildServiceProvider();

            _mapper = serviceProvider.GetService<IMapper>();
        }

        public CategoriesController Sut => new CategoriesController(_mapper, _mediatorMock.Object);

        [Theory]
        [CustomAutoData]
        public async void GetCategories_ReturnsRequestedCategories(List<Category> categories)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetCategoriesRequest>(r => r.LoadProducts == true), default))
                .ReturnsAsync(categories);

            var result = await Sut.GetCategories(default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetCategoriesRequest>(r => r.LoadProducts == true), default), Times.Once);

            result.Should().BeOfType<OkObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void CreateCategory_ReturnsOk_WhenCategoryWithTheSameNameDoesNotExist(
            CategoryCreateEditRequest categoryData,
            Category createdCategory)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetCategoriesByExactNameRequest>(r => r.Name == categoryData.Name), default))
                .ReturnsAsync(new List<Category>());
            _mediatorMock.Setup(m => m.Send(It.IsNotNull<CreateCategoryRequest>(), default))
                .ReturnsAsync(createdCategory);

            var result = await Sut.CreateCategory(categoryData, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetCategoriesByExactNameRequest>(r => r.Name == categoryData.Name), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.IsNotNull<CreateCategoryRequest>(), default), Times.Once);

            result.Should().BeOfType<OkObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void CreateCategory_ReturnsBadRequest_WhenModelStateIsInvalid(
            CategoryCreateEditRequest categoryData,
            string errorMessage)
        {
            var controller = Sut;
            controller.ModelState.AddModelError(errorMessage, errorMessage);

            var result = await controller.CreateCategory(categoryData, default);

            _mediatorMock.Verify(m => m.Send(It.IsAny<GetCategoriesByExactNameRequest>(), default), Times.Never);
            _mediatorMock.Verify(m => m.Send(It.IsAny<CreateCategoryRequest>(), default), Times.Never);
            
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void CreateCategory_ReturnsBadRequest_WhenCategoryWithTheSameNameAlreadyExists(
            CategoryCreateEditRequest categoryData,
            List<Category> categoriesWithTheSameName)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetCategoriesByExactNameRequest>(r => r.Name == categoryData.Name), default))
                .ReturnsAsync(categoriesWithTheSameName);

            var result = await Sut.CreateCategory(categoryData, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetCategoriesByExactNameRequest>(r => r.Name == categoryData.Name), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.IsAny<CreateCategoryRequest>(), default), Times.Never);

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [MemberData(nameof(MemberData_EditCategory_ValidUpdatedCategory))]
        public async void EditCategory_UpdatesCategory_WhenEditedCategoryIsValid(
            int categoryId,
            CategoryCreateEditRequest updatedCategoryData,
            Category originalCategory,
            List<Category> categoriesWithTheSameName)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetCategoryByIdRequest>(r => r.Id == categoryId), default))
                .ReturnsAsync(originalCategory);
            _mediatorMock.Setup(m => m.Send(It.Is<GetCategoriesByExactNameRequest>(r => r.Name == updatedCategoryData.Name), default))
                .ReturnsAsync(categoriesWithTheSameName);

            var result = await Sut.EditCategory(categoryId, updatedCategoryData, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetCategoryByIdRequest>(r => r.Id == categoryId), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.Is<GetCategoriesByExactNameRequest>(r => r.Name == updatedCategoryData.Name), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.IsNotNull<EditCategoryRequest>(), default), Times.Once);
            
            result.Should().BeOfType<OkResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void EditCategory_ReturnsBadRequest_WhenModelStateIsInvalid(
            int categoryId,
            CategoryCreateEditRequest updatedCategoryData,
            string errorMessage)
        {
            var controller = Sut;
            controller.ModelState.AddModelError(errorMessage, errorMessage);

            var result = await controller.EditCategory(categoryId, updatedCategoryData, default);

            _mediatorMock.Verify(m => m.Send(It.IsAny<GetCategoryByIdRequest>(), default), Times.Never);
            _mediatorMock.Verify(m => m.Send(It.IsAny<GetCategoriesByExactNameRequest>(), default), Times.Never);
            _mediatorMock.Verify(m => m.Send(It.IsAny<EditCategoryRequest>(), default), Times.Never);
            
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void EditCategory_ReturnsNotFound_WhenCategoryForUpdateDoesNotExist(
            int categoryId,
            CategoryCreateEditRequest updatedCategoryData)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetCategoryByIdRequest>(r => r.Id == categoryId), default))
                .ReturnsAsync(null as Category);

            var result = await Sut.EditCategory(categoryId, updatedCategoryData, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetCategoryByIdRequest>(r => r.Id == categoryId), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.IsAny<GetCategoriesByExactNameRequest>(), default), Times.Never);
            _mediatorMock.Verify(m => m.Send(It.IsAny<EditCategoryRequest>(), default), Times.Never);

            result.Should().BeOfType<NotFoundResult>();
        }

        [Theory]
        [MemberData(nameof(MemberData_EditCategory_InvalidUpdatedCategory))]
        public async void EditCategory_ReturnsBadRequest_WhenEditedCategoryIsInvalid(
            int categoryId,
            CategoryCreateEditRequest updatedCategoryData,
            Category originalCategory,
            List<Category> categoriesWithTheSameName)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetCategoryByIdRequest>(r => r.Id == categoryId), default))
                .ReturnsAsync(originalCategory);
            _mediatorMock.Setup(m => m.Send(It.Is<GetCategoriesByExactNameRequest>(r => r.Name == updatedCategoryData.Name), default))
                .ReturnsAsync(categoriesWithTheSameName);

            var result = await Sut.EditCategory(categoryId, updatedCategoryData, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetCategoryByIdRequest>(r => r.Id == categoryId), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.Is<GetCategoriesByExactNameRequest>(r => r.Name == updatedCategoryData.Name), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.IsAny<EditCategoryRequest>(), default), Times.Never);

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void DeleteCategory_DeletesCategory_WhenCategoryForDeleteExists(int categoryId, Category categoryForDelete)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetCategoryByIdRequest>(r => r.Id == categoryId), default))
                .ReturnsAsync(categoryForDelete);

            var result = await Sut.DeleteCategory(categoryId, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetCategoryByIdRequest>(r => r.Id == categoryId), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.Is<DeleteCategoryRequest>(r => r.Entity == categoryForDelete), default), Times.Once);
            
            result.Should().BeOfType<OkResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void DeleteCategory_ReturnsNotFound_WhenCategoryForDeleteDoesNotExist(int categoryId)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetCategoryByIdRequest>(r => r.Id == categoryId), default))
                .ReturnsAsync(null as Category);

            var result = await Sut.DeleteCategory(categoryId, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetCategoryByIdRequest>(r => r.Id == categoryId), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.IsAny<DeleteCategoryRequest>(), default), Times.Never);
            
            result.Should().BeOfType<NotFoundResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void GetCategoriesDropdown_ReturnsRequestedCategories(
            CategoryDropdownSearchRequest request,
            List<Category> categories)
        {
            _mediatorMock.Setup(m => m.Send(
                It.Is<GetCategoriesRequest>(r =>
                    r.CategoryNameFilter == request.CategoryNameFilter
                    && r.LoadProducts == false), default))
                .ReturnsAsync(categories);

            var result = await Sut.GetCategoriesDropdown(request, default);

            _mediatorMock.Verify(m => m.Send(
                It.Is<GetCategoriesRequest>(r =>
                    r.CategoryNameFilter == request.CategoryNameFilter
                    && r.LoadProducts == false), default),
                Times.Once);

            result.Should().BeOfType<OkObjectResult>();
        }

        #region Test data

        public static IEnumerable<object[]> MemberData_EditCategory_ValidUpdatedCategory
        {
            get
            {
                var fixture = Fixtures.Custom;

                var categoryId1 = fixture.Create<int>();
                var updatedCategoryData1 = fixture.Build<CategoryCreateEditRequest>()
                    .With(c => c.Name, "Category")
                    .Create();
                var originalCategory1 = fixture.Build<Category>()
                    .With(c => c.Name, "Category")
                    .Create();
                var categoriesWithTheSameName1 = fixture.CreateMany<Category>().ToList();

                var categoryId2 = fixture.Create<int>();
                var updatedCategoryData2 = fixture.Build<CategoryCreateEditRequest>()
                    .With(c => c.Name, "New category")
                    .Create();
                var originalCategory2 = fixture.Build<Category>()
                    .With(c => c.Name, "Category")
                    .Create();
                var categoriesWithTheSameName2 = new List<Category>();

                yield return new object[] { categoryId1, updatedCategoryData1, originalCategory1, categoriesWithTheSameName1 };
                yield return new object[] { categoryId2, updatedCategoryData2, originalCategory2, categoriesWithTheSameName2 };
            }
        }

        public static IEnumerable<object[]> MemberData_EditCategory_InvalidUpdatedCategory
        {
            get
            {
                var fixture = Fixtures.Custom;

                var categoryId1 = fixture.Create<int>();
                var updatedCategoryData1 = fixture.Build<CategoryCreateEditRequest>()
                    .With(c => c.Name, "New category")
                    .Create();
                var originalCategory1 = fixture.Build<Category>()
                    .With(c => c.Name, "Category")
                    .Create();
                var categoriesWithTheSameName1 = fixture.CreateMany<Category>().ToList();
                
                yield return new object[] { categoryId1, updatedCategoryData1, originalCategory1, categoriesWithTheSameName1 };
            }
        }

        #endregion
    }
}
