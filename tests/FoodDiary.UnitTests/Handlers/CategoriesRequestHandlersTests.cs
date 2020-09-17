using System.Collections.Generic;
using System.Linq;
using AutoFixture;
using FluentAssertions;
using FoodDiary.Application.Categories.Handlers;
using FoodDiary.Application.Categories.Requests;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using FoodDiary.UnitTests.Attributes;
using Moq;
using Xunit;

namespace FoodDiary.UnitTests.Handlers
{
    public class CategoriesRequestHandlersTests
    {
        private readonly Mock<ICategoryRepository> _categoryRepositoryMock = new Mock<ICategoryRepository>();

        public CategoriesRequestHandlersTests()
        {
            _categoryRepositoryMock.SetupGet(r => r.UnitOfWork).Returns(new Mock<IUnitOfWork>().Object);
        }

        [Theory]
        [CustomAutoData]
        public async void CreateCategoryRequestHandler_CreatesCategory(CreateCategoryRequest request, Category expectedResult)
        {
            var handler = new CreateCategoryRequestHandler(_categoryRepositoryMock.Object);

            _categoryRepositoryMock.Setup(r => r.Add(request.Entity)).Returns(expectedResult);

            var result = await handler.Handle(request, default);

            _categoryRepositoryMock.Verify(r => r.Add(request.Entity), Times.Once);
            _categoryRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);

            result.Should().BeEquivalentTo(expectedResult);
        }

        [Theory]
        [CustomAutoData]
        public async void EditCategoryRequestHandler_UpdatesCategory(EditCategoryRequest request)
        {
            var handler = new EditCategoryRequestHandler(_categoryRepositoryMock.Object);

            await handler.Handle(request, default);

            _categoryRepositoryMock.Verify(r => r.Update(request.Entity), Times.Once);
            _categoryRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Theory]
        [CustomAutoData]
        public async void DeleteCategoryRequestHandler_DeletesCategory(DeleteCategoryRequest request)
        {
            var handler = new DeleteCategoryRequestHandler(_categoryRepositoryMock.Object);

            await handler.Handle(request, default);

            _categoryRepositoryMock.Verify(r => r.Remove(request.Entity), Times.Once);
            _categoryRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Theory]
        [CustomAutoData]
        public async void GetCategoriesByExactNameRequestHandler_ReturnsRequestedCategories(GetCategoriesByExactNameRequest request, List<Category> categories)
        {
            var categoriesQuery = categories.AsQueryable();
            var handler = new GetCategoriesByExactNameRequestHandler(_categoryRepositoryMock.Object);

            _categoryRepositoryMock.Setup(r => r.GetQueryWithoutTracking())
                .Returns(categoriesQuery);
            _categoryRepositoryMock.Setup(r => r.GetByQueryAsync(It.IsNotNull<IQueryable<Category>>(), default))
                .ReturnsAsync(categories);

            var result = await handler.Handle(request, default);

            _categoryRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _categoryRepositoryMock.Verify(r => r.GetByQueryAsync(It.IsNotNull<IQueryable<Category>>(), default), Times.Once);

            result.Should().BeEquivalentTo(categories);
        }

        [Theory]
        [MemberData(nameof(MemberData_GetCategoriesRequestHandler))]
        public async void GetCategoriesRequestHandler_ReturnsRequestedCategories(
            GetCategoriesRequest request,
            List<Category> categories,
            int loadProductsCallCount)
        {
            var categoriesQuery = categories.AsQueryable();
            var handler = new GetCategoriesRequestHandler(_categoryRepositoryMock.Object);

            _categoryRepositoryMock.Setup(r => r.GetQueryWithoutTracking())
                .Returns(categoriesQuery);
            _categoryRepositoryMock.Setup(r => r.LoadProducts(It.IsNotNull<IQueryable<Category>>()))
                .Returns(categoriesQuery);
            _categoryRepositoryMock.Setup(r => r.GetByQueryAsync(It.IsNotNull<IQueryable<Category>>(), default))
                .ReturnsAsync(categories);

            var result = await handler.Handle(request, default);

            _categoryRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _categoryRepositoryMock.Verify(r => r.LoadProducts(It.IsNotNull<IQueryable<Category>>()), Times.Exactly(loadProductsCallCount));
            _categoryRepositoryMock.Verify(r => r.GetByQueryAsync(It.IsNotNull<IQueryable<Category>>(), default), Times.Once);

            result.Should().BeEquivalentTo(categories);
        }

        [Theory]
        [CustomAutoData]
        public async void GetCategoryByIdRequestHandler_ReturnsRequestedCategory(GetCategoryByIdRequest request, Category expectedResult)
        {
            var handler = new GetCategoryByIdRequestHandler(_categoryRepositoryMock.Object);

            _categoryRepositoryMock.Setup(r => r.GetByIdAsync(request.Id, default))
                .ReturnsAsync(expectedResult);

            var result = await handler.Handle(request, default);

            _categoryRepositoryMock.Verify(r => r.GetByIdAsync(request.Id, default), Times.Once);

            result.Should().BeEquivalentTo(expectedResult);
        }

        #region Test data

        public static IEnumerable<object[]> MemberData_GetCategoriesRequestHandler
        {
            get
            {
                var fixture = Fixtures.Custom;
                var request1 = new GetCategoriesRequest();
                var request2 = new GetCategoriesRequest()
                {
                    CategoryNameFilter = fixture.Create<string>(),
                    LoadProducts = true
                };
                var categories = fixture.CreateMany<Category>().ToList();

                yield return new object[] { request1, categories, 0 };
                yield return new object[] { request2, categories, 1 };
            }
        }

        #endregion
    }
}
