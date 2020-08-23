using System.Collections.Generic;
using System.Linq;
using AutoFixture;
using FluentAssertions;
using FoodDiary.Application.Products.Handlers;
using FoodDiary.Application.Products.Requests;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using FoodDiary.UnitTests.Attributes;
using Moq;
using Xunit;

namespace FoodDiary.UnitTests.Handlers
{
    public class ProductsRequestHandlersTests
    {
        private readonly Mock<IProductRepository> _productRepositoryMock = new Mock<IProductRepository>();

        public ProductsRequestHandlersTests()
        {
            _productRepositoryMock.SetupGet(r => r.UnitOfWork).Returns(new Mock<IUnitOfWork>().Object);
        }

        [Theory]
        [CustomAutoData]
        public async void CreateProductRequestHandler_CreatesProduct(CreateProductRequest request, Product expectedResult)
        {
            var handler = new CreateProductRequestHandler(_productRepositoryMock.Object);

            _productRepositoryMock.Setup(r => r.Create(request.Entity)).Returns(expectedResult);

            var result = await handler.Handle(request, default);

            _productRepositoryMock.Verify(r => r.Create(request.Entity), Times.Once);
            _productRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);

            result.Should().Be(expectedResult);
        }

        [Theory]
        [CustomAutoData]
        public async void DeleteProductRequestHandler_DeletesProduct(DeleteProductRequest request)
        {
            var handler = new DeleteProductRequestHandler(_productRepositoryMock.Object);

            await handler.Handle(request, default);

            _productRepositoryMock.Verify(r => r.Delete(request.Entity), Times.Once);
            _productRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Theory]
        [CustomAutoData]
        public async void DeleteProductsRequestHandler_DeletesProducts(DeleteProductsRequest request)
        {
            var handler = new DeleteProductsRequestHandler(_productRepositoryMock.Object);

            await handler.Handle(request, default);

            _productRepositoryMock.Verify(r => r.DeleteRange(request.Entities), Times.Once);
            _productRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Theory]
        [CustomAutoData]
        public async void EditProductRequestHandler_UpdatesProduct(EditProductRequest request)
        {
            var handler = new EditProductRequestHandler(_productRepositoryMock.Object);

            await handler.Handle(request, default);

            _productRepositoryMock.Verify(r => r.Update(request.Entity), Times.Once);
            _productRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Theory]
        [CustomAutoData]
        public async void GetProductByIdRequestHandler_ReturnsRequestedProduct(GetProductByIdRequest request, Product expectedResult)
        {
            var handler = new GetProductByIdRequestHandler(_productRepositoryMock.Object);

            _productRepositoryMock.Setup(r => r.GetByIdAsync(request.Id, default))
                .ReturnsAsync(expectedResult);

            var result = await handler.Handle(request, default);

            _productRepositoryMock.Verify(r => r.GetByIdAsync(request.Id, default), Times.Once);

            result.Should().Be(expectedResult);
        }

        [Theory]
        [CustomAutoData]
        public async void GetProductsByExactNameRequestHandler_ReturnsRequestedProduct(GetProductsByExactNameRequest request, List<Product> expectedResult)
        {
            var categoriesQuery = expectedResult.AsQueryable();
            var handler = new GetProductsByExactNameRequestHandler(_productRepositoryMock.Object);

            _productRepositoryMock.Setup(r => r.GetQueryWithoutTracking()).Returns(categoriesQuery);
            _productRepositoryMock.Setup(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Product>>(), default))
                .ReturnsAsync(expectedResult);

            var result = await handler.Handle(request, default);

            _productRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _productRepositoryMock.Verify(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Product>>(), default), Times.Once);
        }

        [Theory]
        [CustomAutoData]
        public async void GetProductsByIdsRequestHandler_ReturnsRequestedProducts(GetProductsByIdsRequest request, List<Product> expectedResult)
        {
            var handler = new GetProductsByIdsRequestHandler(_productRepositoryMock.Object);

            _productRepositoryMock.Setup(r => r.GetByIdsAsync(request.Ids, default))
                .ReturnsAsync(expectedResult);

            var result = await handler.Handle(request, default);

            _productRepositoryMock.Verify(r => r.GetByIdsAsync(request.Ids, default), Times.Once);

            result.Should().Contain(expectedResult);
        }

        [Theory]
        [MemberData(nameof(MemberData_GetProductsRequestHandler))]
        public async void GetProductsRequestHandler_ReturnsRequestedProducts(
            GetProductsRequest request,
            List<Product> expectedFoundProducts,
            int? expectedTotalProductsCount,
            int expectedCountByQueryCallCount,
            int expectedLoadCategoryCallCount)
        {
            var productsQuery = expectedFoundProducts.AsQueryable();
            var handler = new GetProductsRequestHandler(_productRepositoryMock.Object);

            _productRepositoryMock.Setup(r => r.GetQueryWithoutTracking()).Returns(productsQuery);
            _productRepositoryMock.Setup(r => r.CountByQueryAsync(It.IsNotNull<IQueryable<Product>>(), default))
                .ReturnsAsync(expectedTotalProductsCount.GetValueOrDefault());
            _productRepositoryMock.Setup(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Product>>(), default))
                .ReturnsAsync(expectedFoundProducts);

            var result = await handler.Handle(request, default);

            _productRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _productRepositoryMock.Verify(r => r.CountByQueryAsync(It.IsNotNull<IQueryable<Product>>(), default), Times.Exactly(expectedCountByQueryCallCount));
            _productRepositoryMock.Verify(r => r.LoadCategory(It.IsNotNull<IQueryable<Product>>()), Times.Exactly(expectedLoadCategoryCallCount));
            _productRepositoryMock.Verify(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Product>>(), default), Times.Once);

            result.FoundProducts.Should().Contain(expectedFoundProducts);
            result.TotalProductsCount.Should().Be(expectedTotalProductsCount);
        }

        #region Test data

        public static IEnumerable<object[]> MemberData_GetProductsRequestHandler
        {
            get
            {
                var fixture = Fixtures.Custom;
                var expectedProducts = fixture.CreateMany<Product>().ToList();

                var request1 = new GetProductsRequest();
                var request2 = new GetProductsRequest()
                {
                    CalculateTotalProductsCount = true
                };
                var request3 = new GetProductsRequest()
                {
                    LoadCategory = true
                };
                var request4 = new GetProductsRequest()
                {
                    CalculateTotalProductsCount = true,
                    LoadCategory = true
                };

                yield return new object[] { request1, expectedProducts, null, 0, 0 };
                yield return new object[] { request2, expectedProducts, fixture.Create<int>(), 1, 0 };
                yield return new object[] { request3, expectedProducts, null, 0, 1 };
                yield return new object[] { request4, expectedProducts, fixture.Create<int>(), 1, 1 };
            }
        }

        #endregion
    }
}
