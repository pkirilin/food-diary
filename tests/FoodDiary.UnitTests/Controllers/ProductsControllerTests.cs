using System.Linq;
using System.Reflection;
using AutoMapper;
using FluentAssertions;
using FoodDiary.API;
using FoodDiary.API.Controllers.v1;
using FoodDiary.API.Services;
using FoodDiary.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Xunit;
using FoodDiary.API.Requests;
using FoodDiary.API.Metadata;
using FoodDiary.UnitTests.Attributes;
using System.Collections.Generic;

namespace FoodDiary.UnitTests.Controllers
{
    public class ProductsControllerTests
    {
        private readonly IMapper _mapper;

        private readonly Mock<IProductService> _productServiceMock;
        private readonly Mock<ICategoryService> _categoryServiceMock;

        public ProductsControllerTests()
        {
            var serviceProvider = new ServiceCollection()
                .AddAutoMapper(Assembly.GetAssembly(typeof(AutoMapperProfile)))
                .BuildServiceProvider();

            _mapper = serviceProvider.GetService<IMapper>();
            _productServiceMock = new Mock<IProductService>();
            _categoryServiceMock = new Mock<ICategoryService>();
        }

        public ProductsController Sut => new ProductsController(
            _mapper,
            _productServiceMock.Object,
            _categoryServiceMock.Object);

        [Theory]
        [CustomAutoData]
        public async void GetProducts_ReturnsFilteredProducts_WhenRequestedCategoryIsNotNullAndExists(
            ProductsSearchRequest request,
            Category requestedCategory,
            ProductsSearchResultMetadata productSearchResult)
        {
            _categoryServiceMock.Setup(s => s.GetCategoryByIdAsync(request.CategoryId.GetValueOrDefault(), default))
                .ReturnsAsync(requestedCategory);

            _productServiceMock.Setup(s => s.SearchProductsAsync(request, default))
                .ReturnsAsync(productSearchResult);

            var result = await Sut.GetProducts(request, default);

            _categoryServiceMock.Verify(s => s.GetCategoryByIdAsync(request.CategoryId.GetValueOrDefault(), default), Times.Once);
            _productServiceMock.Verify(s => s.SearchProductsAsync(request, default), Times.Once);
            
            result.Should().BeOfType<OkObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void GetProducts_ReturnsFilteredProducts_WhenRequestedCategoryIsNull(
            ProductsSearchRequest request, ProductsSearchResultMetadata productSearchResult)
        {
            request.CategoryId = null;

            _productServiceMock.Setup(s => s.SearchProductsAsync(request, default))
                .ReturnsAsync(productSearchResult);

            var result = await Sut.GetProducts(request, default);

            _categoryServiceMock.Verify(s => s.GetCategoryByIdAsync(It.IsAny<int>(), default), Times.Never);
            _productServiceMock.Verify(s => s.SearchProductsAsync(request, default), Times.Once);
            
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

            _categoryServiceMock.Verify(s => s.GetCategoryByIdAsync(It.IsAny<int>(), default), Times.Never);
            _productServiceMock.Verify(s => s.SearchProductsAsync(request, default), Times.Never);
            
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void GetProducts_ReturnsNotFound_WhenRequestedCategoryIsNotNullAndNotFound(
            ProductsSearchRequest request)
        {
            _categoryServiceMock.Setup(s => s.GetCategoryByIdAsync(request.CategoryId.GetValueOrDefault(), default))
                .ReturnsAsync(null as Category);

            var result = await Sut.GetProducts(request, default);

            _categoryServiceMock.Verify(s => s.GetCategoryByIdAsync(request.CategoryId.GetValueOrDefault(), default), Times.Once);
            _productServiceMock.Verify(s => s.SearchProductsAsync(request, default), Times.Never);
            
            result.Should().BeOfType<NotFoundResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void CreateProduct_CreatesProduct_WhenProductWithTheSameNameDoesNotExist(
            ProductCreateEditRequest productData)
        {
            _productServiceMock.Setup(s => s.IsProductExistsAsync(productData.Name, default))
                .ReturnsAsync(false);

            var result = await Sut.CreateProduct(productData, default);

            _productServiceMock.Verify(s => s.IsProductExistsAsync(productData.Name, default), Times.Once);
            _productServiceMock.Verify(s => s.CreateProductAsync(It.IsNotNull<Product>(), default), Times.Once);
            
            result.Should().BeOfType<OkResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void CreateProduct_ReturnsBadRequest_WhenModelStateIsInvalid(
            ProductCreateEditRequest productData, string errorMessage)
        {
            var controller = Sut;
            controller.ModelState.AddModelError(errorMessage, errorMessage);

            var result = await controller.CreateProduct(productData, default);

            _productServiceMock.Verify(s => s.IsProductExistsAsync(productData.Name, default), Times.Never);
            _productServiceMock.Verify(s => s.CreateProductAsync(It.IsNotNull<Product>(), default), Times.Never);
            
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void EditProduct_UpdatesProduct_WhenEditedProductIsValid(
            int productId, ProductCreateEditRequest updatedProductData, Product originalProduct)
        {
            _productServiceMock.Setup(s => s.GetProductByIdAsync(productId, default))
                .ReturnsAsync(originalProduct);

            _productServiceMock.Setup(s => s.IsProductExistsAsync(updatedProductData.Name, default))
                .ReturnsAsync(false);

            _productServiceMock.Setup(s => s.IsEditedProductValid(updatedProductData, originalProduct, false))
                .Returns(true);

            var result = await Sut.EditProduct(productId, updatedProductData, default);

            _productServiceMock.Verify(s => s.GetProductByIdAsync(productId, default), Times.Once);
            _productServiceMock.Verify(s => s.IsProductExistsAsync(updatedProductData.Name, default), Times.Once);
            _productServiceMock.Verify(s => s.IsEditedProductValid(updatedProductData, originalProduct, false), Times.Once);
            _productServiceMock.Verify(s => s.EditProductAsync(It.IsNotNull<Product>(), default), Times.Once);
            
            result.Should().BeOfType<OkResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void EditProduct_ReturnsBadRequest_WhenModelStateIsInvalid(
            int productId, ProductCreateEditRequest updatedProductData, string errorMessage)
        {
            var controller = Sut;
            controller.ModelState.AddModelError(errorMessage, errorMessage);

            var result = await controller.EditProduct(productId, updatedProductData, default);

            _productServiceMock.Verify(s => s.GetProductByIdAsync(productId, default), Times.Never);
            _productServiceMock.Verify(s => s.IsProductExistsAsync(updatedProductData.Name, default), Times.Never);
            _productServiceMock.Verify(s => s.IsEditedProductValid(updatedProductData, It.IsAny<Product>(), It.IsAny<bool>()), Times.Never);
            _productServiceMock.Verify(s => s.EditProductAsync(It.IsNotNull<Product>(), default), Times.Never);
            
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void EditProduct_ReturnsNotFound_WhenRequestedProductDoesNotExist(
            int productId, ProductCreateEditRequest updatedProductData)
        {
            _productServiceMock.Setup(s => s.GetProductByIdAsync(productId, default))
                .ReturnsAsync(null as Product);

            var result = await Sut.EditProduct(productId, updatedProductData, default);

            _productServiceMock.Verify(s => s.GetProductByIdAsync(productId, default), Times.Once);
            _productServiceMock.Verify(s => s.IsProductExistsAsync(updatedProductData.Name, default), Times.Never);
            _productServiceMock.Verify(s => s.IsEditedProductValid(updatedProductData, It.IsAny<Product>(), It.IsAny<bool>()), Times.Never);
            _productServiceMock.Verify(s => s.EditProductAsync(It.IsNotNull<Product>(), default), Times.Never);
            
            result.Should().BeOfType<NotFoundResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void EditProduct_ReturnsBadRequest_WhenEditedProductIsInvalid(
            int productId, ProductCreateEditRequest updatedProductData, Product originalProduct)
        {
            _productServiceMock.Setup(s => s.GetProductByIdAsync(productId, default))
                .ReturnsAsync(originalProduct);

            _productServiceMock.Setup(s => s.IsProductExistsAsync(updatedProductData.Name, default))
                .ReturnsAsync(false);

            _productServiceMock.Setup(s => s.IsEditedProductValid(updatedProductData, originalProduct, false))
                .Returns(false);

            var result = await Sut.EditProduct(productId, updatedProductData, default);

            _productServiceMock.Verify(s => s.GetProductByIdAsync(productId, default), Times.Once);
            _productServiceMock.Verify(s => s.IsProductExistsAsync(updatedProductData.Name, default), Times.Once);
            _productServiceMock.Verify(s => s.IsEditedProductValid(updatedProductData, originalProduct, false), Times.Once);
            _productServiceMock.Verify(s => s.EditProductAsync(It.IsNotNull<Product>(), default), Times.Never);
            
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void DeleteProduct_DeletesProduct_WhenRequestedProductExists(
            int productForDeleteId, Product productForDelete)
        {
            _productServiceMock.Setup(s => s.GetProductByIdAsync(productForDeleteId, default))
                .ReturnsAsync(productForDelete);

            var result = await Sut.DeleteProduct(productForDeleteId, default);

            _productServiceMock.Verify(s => s.GetProductByIdAsync(productForDeleteId, default), Times.Once);
            _productServiceMock.Verify(s => s.DeleteProductAsync(productForDelete, default), Times.Once);
            
            result.Should().BeOfType<OkResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void DeleteProduct_ReturnsNotFound_WhenRequestedProductDoesNotExist(
            int productForDeleteId)
        {
            _productServiceMock.Setup(s => s.GetProductByIdAsync(productForDeleteId, default))
                .ReturnsAsync(null as Product);

            var result = await Sut.DeleteProduct(productForDeleteId, default);

            _productServiceMock.Verify(s => s.GetProductByIdAsync(productForDeleteId, default), Times.Once);
            _productServiceMock.Verify(s => s.DeleteProductAsync(It.IsNotNull<Product>(), default), Times.Never);
            
            result.Should().BeOfType<NotFoundResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void DeleteProducts_DeletesProducts_WhenAllProductsWithRequestedIdsExist(
            IEnumerable<Product> productsForDelete)
        {
            var productsForDeleteIds = productsForDelete.Select(p => p.Id);

            _productServiceMock.Setup(s => s.GetProductsByIdsAsync(productsForDeleteIds, default))
                .ReturnsAsync(productsForDelete);

            _productServiceMock.Setup(s => s.AreAllProductsFetched(productsForDelete, productsForDeleteIds))
                .Returns(true);

            var result = await Sut.DeleteProducts(productsForDeleteIds, default);

            _productServiceMock.Verify(s => s.GetProductsByIdsAsync(productsForDeleteIds, default), Times.Once);
            _productServiceMock.Verify(s => s.AreAllProductsFetched(productsForDelete, productsForDeleteIds), Times.Once);
            _productServiceMock.Verify(s => s.DeleteProductsRangeAsync(productsForDelete, default), Times.Once);
            
            result.Should().BeOfType<OkResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void DeleteProducts_ReturnsBadRequest_WhenAtLeastOneRequestedProductDoesNotExist(
            IEnumerable<Product> productsForDelete)
        {
            var productsForDeleteIds = productsForDelete.Select(p => p.Id);

            _productServiceMock.Setup(s => s.GetProductsByIdsAsync(productsForDeleteIds, default))
                .ReturnsAsync(productsForDelete);

            _productServiceMock.Setup(s => s.AreAllProductsFetched(productsForDelete, productsForDeleteIds))
                .Returns(false);

            var result = await Sut.DeleteProducts(productsForDeleteIds, default);

            _productServiceMock.Verify(s => s.GetProductsByIdsAsync(productsForDeleteIds, default), Times.Once);
            _productServiceMock.Verify(s => s.AreAllProductsFetched(productsForDelete, productsForDeleteIds), Times.Once);
            _productServiceMock.Verify(s => s.DeleteProductsRangeAsync(productsForDelete, default), Times.Never);
            
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void GetProductsDropdown_ReturnsRequestedProducts(
            ProductDropdownSearchRequest request, IEnumerable<Product> products)
        {
            _productServiceMock.Setup(s => s.GetProductsDropdownAsync(request, default))
                .ReturnsAsync(products);

            var result = await Sut.GetProductsDropdown(request, default);

            _productServiceMock.Verify(s => s.GetProductsDropdownAsync(request, default), Times.Once);
            
            result.Should().BeOfType<OkObjectResult>();
        }
    }
}
