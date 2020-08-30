using System.Linq;
using System.Reflection;
using AutoMapper;
using FluentAssertions;
using FoodDiary.API;
using FoodDiary.API.Controllers.v1;
using FoodDiary.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Xunit;
using FoodDiary.API.Requests;
using FoodDiary.UnitTests.Attributes;
using System.Collections.Generic;
using MediatR;
using FoodDiary.Application.Products.Requests;
using FoodDiary.Application.Models;
using AutoFixture;

namespace FoodDiary.UnitTests.Controllers
{
    public class ProductsControllerTests
    {
        private readonly IMapper _mapper;
        private readonly Mock<IMediator> _mediatorMock = new Mock<IMediator>();

        public ProductsControllerTests()
        {
            var serviceProvider = new ServiceCollection()
                .AddAutoMapper(Assembly.GetAssembly(typeof(AutoMapperProfile)))
                .BuildServiceProvider();

            _mapper = serviceProvider.GetService<IMapper>();
        }

        public ProductsController Sut => new ProductsController(_mapper, _mediatorMock.Object);

        [Theory]
        [CustomAutoData]
        public async void GetProducts_ReturnsFilteredProducts(
            ProductsSearchRequest request,
            ProductsSearchResult productSearchResult)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetProductsRequest>(r =>
                    r.PageNumber == request.PageNumber
                    && r.PageSize == request.PageSize
                    && r.ProductName == request.ProductSearchName
                    && r.CategoryId == request.CategoryId
                    && r.LoadCategory == true
                    && r.CalculateTotalProductsCount == true), default))
                .ReturnsAsync(productSearchResult);

            var result = await Sut.GetProducts(request, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetProductsRequest>(r =>
                    r.PageNumber == request.PageNumber
                    && r.PageSize == request.PageSize
                    && r.ProductName == request.ProductSearchName
                    && r.CategoryId == request.CategoryId
                    && r.LoadCategory == true
                    && r.CalculateTotalProductsCount == true), default),
                Times.Once);
            result.Should().BeOfType<OkObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void GetProducts_ReturnsBadRequest_WhenModelStateIsInvalid(
            ProductsSearchRequest request, string errorMessage)
        {
            var controller = Sut;
            controller.ModelState.AddModelError(errorMessage, errorMessage);

            var result = await controller.GetProducts(request, default);

            _mediatorMock.Verify(m => m.Send(It.IsAny<GetProductsRequest>(), default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void CreateProduct_CreatesProduct_WhenProductWithTheSameNameDoesNotExist(ProductCreateEditRequest productData)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetProductsByExactNameRequest>(r => r.Name == productData.Name), default))
                .ReturnsAsync(new List<Product>());

            var result = await Sut.CreateProduct(productData, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetProductsByExactNameRequest>(r => r.Name == productData.Name), default), Times.Once);
            result.Should().BeOfType<OkResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void CreateProduct_ReturnsBadRequest_WhenProductWithTheSameNameExists(
            ProductCreateEditRequest productData,
            List<Product> products)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetProductsByExactNameRequest>(r => r.Name == productData.Name), default))
                .ReturnsAsync(products);

            var result = await Sut.CreateProduct(productData, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetProductsByExactNameRequest>(r => r.Name == productData.Name), default), Times.Once);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void CreateProduct_ReturnsBadRequest_WhenModelStateIsInvalid(ProductCreateEditRequest productData, string errorMessage)
        {
            var controller = Sut;
            controller.ModelState.AddModelError(errorMessage, errorMessage);

            var result = await controller.CreateProduct(productData, default);

            _mediatorMock.Verify(m => m.Send(It.IsAny<GetProductsByExactNameRequest>(), default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [MemberData(nameof(MemberData_EditProduct_ValidUpdatedProduct))]
        public async void EditProduct_UpdatesProduct_WhenEditedProductIsValid(
            int productId,
            ProductCreateEditRequest updatedProductData,
            Product originalProduct,
            List<Product> productsWithTheSameName)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetProductByIdRequest>(r => r.Id == productId), default))
                .ReturnsAsync(originalProduct);
            _mediatorMock.Setup(m => m.Send(It.Is<GetProductsByExactNameRequest>(r => r.Name == updatedProductData.Name), default))
                .ReturnsAsync(productsWithTheSameName);

            var result = await Sut.EditProduct(productId, updatedProductData, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetProductByIdRequest>(r => r.Id == productId), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.Is<GetProductsByExactNameRequest>(r => r.Name == updatedProductData.Name), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.IsNotNull<EditProductRequest>(), default), Times.Once);
            result.Should().BeOfType<OkResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void EditProduct_ReturnsBadRequest_WhenModelStateIsInvalid(
            int productId,
            ProductCreateEditRequest updatedProductData,
            string errorMessage)
        {
            var controller = Sut;
            controller.ModelState.AddModelError(errorMessage, errorMessage);

            var result = await controller.EditProduct(productId, updatedProductData, default);

            _mediatorMock.Verify(m => m.Send(It.IsAny<GetProductByIdRequest>(), default), Times.Never);
            _mediatorMock.Verify(m => m.Send(It.IsAny<GetProductsByExactNameRequest>(), default), Times.Never);
            _mediatorMock.Verify(m => m.Send(It.IsAny<EditProductRequest>(), default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void EditProduct_ReturnsNotFound_WhenRequestedProductDoesNotExist(
            int productId,
            ProductCreateEditRequest updatedProductData)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetProductByIdRequest>(r => r.Id == productId), default))
                .ReturnsAsync(null as Product);

            var result = await Sut.EditProduct(productId, updatedProductData, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetProductByIdRequest>(r => r.Id == productId), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.IsAny<GetProductsByExactNameRequest>(), default), Times.Never);
            _mediatorMock.Verify(m => m.Send(It.IsAny<EditProductRequest>(), default), Times.Never);
            result.Should().BeOfType<NotFoundResult>();
        }

        [Theory]
        [MemberData(nameof(MemberData_EditProduct_invalidUpdatedProduct))]
        public async void EditProduct_ReturnsBadRequest_WhenEditedProductIsInvalid(
            int productId,
            ProductCreateEditRequest updatedProductData,
            Product originalProduct,
            List<Product> productsWithTheSameName)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetProductByIdRequest>(r => r.Id == productId), default))
                .ReturnsAsync(originalProduct);
            _mediatorMock.Setup(m => m.Send(It.Is<GetProductsByExactNameRequest>(r => r.Name == updatedProductData.Name), default))
                .ReturnsAsync(productsWithTheSameName);

            var result = await Sut.EditProduct(productId, updatedProductData, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetProductByIdRequest>(r => r.Id == productId), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.Is<GetProductsByExactNameRequest>(r => r.Name == updatedProductData.Name), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.IsAny<EditProductRequest>(), default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void DeleteProduct_DeletesProduct_WhenRequestedProductExists(
            int productForDeleteId,
            Product productForDelete)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetProductByIdRequest>(r => r.Id == productForDeleteId), default))
                .ReturnsAsync(productForDelete);

            var result = await Sut.DeleteProduct(productForDeleteId, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetProductByIdRequest>(r => r.Id == productForDeleteId), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.Is<DeleteProductRequest>(r => r.Entity == productForDelete), default), Times.Once);
            result.Should().BeOfType<OkResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void DeleteProduct_ReturnsNotFound_WhenRequestedProductDoesNotExist(int productForDeleteId)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetProductByIdRequest>(r => r.Id == productForDeleteId), default))
                .ReturnsAsync(null as Product);

            var result = await Sut.DeleteProduct(productForDeleteId, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetProductByIdRequest>(r => r.Id == productForDeleteId), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.IsAny<DeleteProductRequest>(), default), Times.Never);
            result.Should().BeOfType<NotFoundResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void DeleteProducts_DeletesProducts_WhenAllProductsWithRequestedIdsExist(
            IEnumerable<int> productsIds,
            List<Product> productsForDelete)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetProductsByIdsRequest>(r => r.Ids == productsIds), default))
                .ReturnsAsync(productsForDelete);

            var result = await Sut.DeleteProducts(productsIds, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetProductsByIdsRequest>(r => r.Ids == productsIds), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.Is<DeleteProductsRequest>(r => r.Entities == productsForDelete), default), Times.Once);
            result.Should().BeOfType<OkResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void GetProductsDropdown_ReturnsRequestedProducts(
            ProductDropdownSearchRequest request,
            ProductsSearchResult productsSearchResult)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetProductsRequest>(r =>
                    r.PageNumber == 1
                    && r.PageSize == 10
                    && r.ProductName == request.ProductNameFilter
                    && r.CategoryId == null
                    && r.LoadCategory == false
                    && r.CalculateTotalProductsCount == false), default))
                .ReturnsAsync(productsSearchResult);

            var result = await Sut.GetProductsDropdown(request, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetProductsRequest>(r =>
                    r.PageNumber == 1
                    && r.PageSize == 10
                    && r.ProductName == request.ProductNameFilter
                    && r.CategoryId == null
                    && r.LoadCategory == false
                    && r.CalculateTotalProductsCount == false), default),
                Times.Once);
            result.Should().BeOfType<OkObjectResult>();
        }

        #region Test data

        public static IEnumerable<object[]> MemberData_EditProduct_ValidUpdatedProduct
        {
            get
            {
                var fixture = Fixtures.Custom;
                
                var productId1 = fixture.Create<int>();
                var updatedProductData1 = fixture.Build<ProductCreateEditRequest>()
                    .With(p => p.Name, "Product")
                    .Create();
                var originalProduct1 = fixture.Build<Product>()
                    .With(p => p.Name, "Product")
                    .Create();
                var productsWithTheSameName1 = fixture.CreateMany<Product>().ToList();

                var productId2 = fixture.Create<int>();
                var updatedProductData2 = fixture.Build<ProductCreateEditRequest>()
                    .With(p => p.Name, "Product")
                    .Create();
                var originalProduct2 = fixture.Build<Product>()
                    .With(p => p.Name, "New product")
                    .Create();
                var productsWithTheSameName2 = new List<Product>();

                yield return new object[] { productId1, updatedProductData1, originalProduct1, productsWithTheSameName1 };
                yield return new object[] { productId2, updatedProductData2, originalProduct2, productsWithTheSameName2 };
            }
        }

        public static IEnumerable<object[]> MemberData_EditProduct_invalidUpdatedProduct
        {
            get
            {
                var fixture = Fixtures.Custom;

                var productId = fixture.Create<int>();
                var updatedProductData = fixture.Build<ProductCreateEditRequest>()
                    .With(p => p.Name, "Product")
                    .Create();
                var originalProduct = fixture.Build<Product>()
                    .With(p => p.Name, "New product")
                    .Create();
                var productsWithTheSameName = fixture.CreateMany<Product>().ToList();

                yield return new object[] { productId, updatedProductData, originalProduct, productsWithTheSameName };
            }
        }

        #endregion
    }
}
