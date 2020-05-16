using System.Linq;
using System.Reflection;
using AutoFixture;
using AutoFixture.Xunit2;
using AutoMapper;
using FluentAssertions;
using FoodDiary.API;
using FoodDiary.API.Controllers.v1;
using FoodDiary.API.Services;
using FoodDiary.Domain.Entities;
using FoodDiary.UnitTests.Customizations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Xunit;
using FoodDiary.API.Requests;
using FoodDiary.API.Metadata;

namespace FoodDiary.UnitTests.Controllers
{
    public class ProductsControllerTests
    {
        private readonly IMapper _mapper;

        private readonly Mock<IProductService> _productServiceMock;
        private readonly Mock<ICategoryService> _categoryServiceMock;

        private readonly IFixture _fixture;

        public ProductsControllerTests()
        {
            var serviceProvider = new ServiceCollection()
                .AddAutoMapper(Assembly.GetAssembly(typeof(AutoMapperProfile)))
                .BuildServiceProvider();

            _mapper = serviceProvider.GetService<IMapper>();
            _productServiceMock = new Mock<IProductService>();
            _categoryServiceMock = new Mock<ICategoryService>();
            _fixture = SetupFixture();
        }

        private IFixture SetupFixture()
        {
            var _fixture = new Fixture();
            _fixture.Customize(new FixtureWithCircularReferencesCustomization());
            return _fixture;
        }

        public ProductsController ProductsController => new ProductsController(_mapper, _productServiceMock.Object, _categoryServiceMock.Object);

        [Theory]
        [InlineAutoData]
        public async void GetProducts_ReturnsFilteredProductsWithPaginationInfo_WhenModelStateIsValid_AndCategoryExists(int categoryId)
        {
            var searchRequest = _fixture.Build<ProductsSearchRequest>()
                .With(r => r.CategoryId, categoryId)
                .Create();
            var requestedCategory = _fixture.Create<Category>();
            var productSearchMeta = _fixture.Create<ProductsSearchResultMetadata>();
            _categoryServiceMock.Setup(s => s.GetCategoryByIdAsync(categoryId, default))
                .ReturnsAsync(requestedCategory);
            _productServiceMock.Setup(s => s.SearchProductsAsync(searchRequest, default))
                .ReturnsAsync(productSearchMeta);

            var result = await ProductsController.GetProducts(searchRequest, default);

            _categoryServiceMock.Verify(s => s.GetCategoryByIdAsync(categoryId, default), Times.Once);
            _productServiceMock.Verify(s => s.SearchProductsAsync(searchRequest, default), Times.Once);
            result.Should().BeOfType<OkObjectResult>();
        }

        [Fact]
        public async void GetProducts_ReturnsFilteredProductsWithPaginationInfo_WhenModelStateIsValid_AndCategoryIsEmpty()
        {
            var searchRequest = _fixture.Build<ProductsSearchRequest>()
                .With(r => r.CategoryId, null as int?)
                .Create();
            var productSearchMeta = _fixture.Create<ProductsSearchResultMetadata>();
            _productServiceMock.Setup(s => s.SearchProductsAsync(searchRequest, default))
                .ReturnsAsync(productSearchMeta);

            var result = await ProductsController.GetProducts(searchRequest, default);

            _categoryServiceMock.Verify(s => s.GetCategoryByIdAsync(It.IsAny<int>(), default), Times.Never);
            _productServiceMock.Verify(s => s.SearchProductsAsync(searchRequest, default), Times.Once);
            result.Should().BeOfType<OkObjectResult>();
        }

        [Fact]
        public async void GetProducts_ReturnsBadRequest_WhenModelStateIsInvalid()
        {
            var searchRequest = _fixture.Create<ProductsSearchRequest>();
            var controller = ProductsController;
            controller.ModelState.AddModelError(_fixture.Create<string>(), _fixture.Create<string>());

            var result = await controller.GetProducts(searchRequest, default);

            _categoryServiceMock.Verify(s => s.GetCategoryByIdAsync(It.IsAny<int>(), default), Times.Never);
            _productServiceMock.Verify(s => s.SearchProductsAsync(searchRequest, default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [InlineAutoData]
        public async void GetProducts_ReturnsNotFound_WhenCategoryNotFound(int categoryId)
        {
            var searchRequest = _fixture.Build<ProductsSearchRequest>()
                .With(r => r.CategoryId, categoryId)
                .Create();
            _categoryServiceMock.Setup(s => s.GetCategoryByIdAsync(categoryId, default))
                .ReturnsAsync(null as Category);

            var result = await ProductsController.GetProducts(searchRequest, default);

            _categoryServiceMock.Verify(s => s.GetCategoryByIdAsync(categoryId, default), Times.Once);
            _productServiceMock.Verify(s => s.SearchProductsAsync(searchRequest, default), Times.Never);
            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async void CreateProduct_CreatesProductSuccessfully_WhenProductDataIsValid()
        {
            var request = _fixture.Create<ProductCreateEditRequest>();
            _productServiceMock.Setup(s => s.IsProductExistsAsync(request.Name, default))
                .ReturnsAsync(false);

            var result = await ProductsController.CreateProduct(request, default);

            _productServiceMock.Verify(s => s.IsProductExistsAsync(request.Name, default), Times.Once);
            _productServiceMock.Verify(s => s.CreateProductAsync(It.IsNotNull<Product>(), default), Times.Once);
            result.Should().BeOfType<OkResult>();
        }

        [Fact]
        public async void CreateProduct_ReturnsBadRequest_WhenModelStateIsInvalid()
        {
            var request = _fixture.Create<ProductCreateEditRequest>();
            var controller = ProductsController;
            controller.ModelState.AddModelError("error", "error");

            var result = await controller.CreateProduct(request, default);

            _productServiceMock.Verify(s => s.IsProductExistsAsync(request.Name, default), Times.Never);
            _productServiceMock.Verify(s => s.CreateProductAsync(It.IsNotNull<Product>(), default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async void EditProduct_UpdatesProductSuccessfully_WhenProductDataIsValid()
        {
            var productId = _fixture.Create<int>();
            var request = _fixture.Create<ProductCreateEditRequest>();
            var originalProduct = _fixture.Create<Product>();

            _productServiceMock.Setup(s => s.GetProductByIdAsync(productId, default))
                .ReturnsAsync(originalProduct);
            _productServiceMock.Setup(s => s.IsProductExistsAsync(request.Name, default))
                .ReturnsAsync(false);
            _productServiceMock.Setup(s => s.IsEditedProductValid(request, originalProduct, false))
                .Returns(true);

            var result = await ProductsController.EditProduct(productId, request, default);

            _productServiceMock.Verify(s => s.GetProductByIdAsync(productId, default), Times.Once);
            _productServiceMock.Verify(s => s.IsProductExistsAsync(request.Name, default), Times.Once);
            _productServiceMock.Verify(s => s.IsEditedProductValid(request, originalProduct, false), Times.Once);
            _productServiceMock.Verify(s => s.EditProductAsync(It.IsNotNull<Product>(), default), Times.Once);
            result.Should().BeOfType<OkResult>();
        }

        [Fact]
        public async void EditProduct_ReturnsBadRequest_WhenModelStateIsInvalid()
        {
            var productId = _fixture.Create<int>();
            var request = _fixture.Create<ProductCreateEditRequest>();
            var controller = ProductsController;
            controller.ModelState.AddModelError("error", "error");

            var result = await controller.EditProduct(productId, request, default);

            _productServiceMock.Verify(s => s.GetProductByIdAsync(It.IsAny<int>(), default), Times.Never);
            _productServiceMock.Verify(s => s.IsProductExistsAsync(request.Name, default), Times.Never);
            _productServiceMock.Verify(s => s.IsEditedProductValid(request, It.IsAny<Product>(), It.IsAny<bool>()), Times.Never);
            _productServiceMock.Verify(s => s.EditProductAsync(It.IsNotNull<Product>(), default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async void EditProduct_ReturnsNotFound_WhenRequestedProductDoesNotExist()
        {
            var productId = _fixture.Create<int>();
            var request = _fixture.Create<ProductCreateEditRequest>();
            _productServiceMock.Setup(s => s.GetProductByIdAsync(It.IsAny<int>(), default))
                .ReturnsAsync(null as Product);

            var result = await ProductsController.EditProduct(productId, request, default);

            _productServiceMock.Verify(s => s.GetProductByIdAsync(It.IsAny<int>(), default), Times.Once);
            _productServiceMock.Verify(s => s.IsProductExistsAsync(request.Name, default), Times.Never);
            _productServiceMock.Verify(s => s.IsEditedProductValid(request, It.IsAny<Product>(), It.IsAny<bool>()), Times.Never);
            _productServiceMock.Verify(s => s.EditProductAsync(It.IsNotNull<Product>(), default), Times.Never);
            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async void EditProduct_ReturnsBadRequest_WhenProductDataIsInvalid()
        {
            var productId = _fixture.Create<int>();
            var request = _fixture.Create<ProductCreateEditRequest>();
            var originalProduct = _fixture.Create<Product>();

            _productServiceMock.Setup(s => s.GetProductByIdAsync(productId, default))
                .ReturnsAsync(originalProduct);
            _productServiceMock.Setup(s => s.IsProductExistsAsync(request.Name, default))
                .ReturnsAsync(false);
            _productServiceMock.Setup(s => s.IsEditedProductValid(request, originalProduct, false))
                .Returns(false);

            var result = await ProductsController.EditProduct(productId, request, default);

            _productServiceMock.Verify(s => s.GetProductByIdAsync(productId, default), Times.Once);
            _productServiceMock.Verify(s => s.IsProductExistsAsync(request.Name, default), Times.Once);
            _productServiceMock.Verify(s => s.IsEditedProductValid(request, originalProduct, false), Times.Once);
            _productServiceMock.Verify(s => s.EditProductAsync(It.IsNotNull<Product>(), default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async void DeleteProduct_DeletesProduct_WhenRequestedProductExists()
        {
            var product = _fixture.Create<Product>();
            _productServiceMock.Setup(s => s.GetProductByIdAsync(product.Id, default))
                .ReturnsAsync(product);

            var result = await ProductsController.DeleteProduct(product.Id, default);

            _productServiceMock.Verify(s => s.GetProductByIdAsync(product.Id, default), Times.Once);
            _productServiceMock.Verify(s => s.DeleteProductAsync(product, default), Times.Once);
            result.Should().BeOfType<OkResult>();
        }

        [Fact]
        public async void DeleteProduct_ReturnsNotFound_WhenRequestedProductDoesNotExist()
        {
            var product = _fixture.Create<Product>();
            _productServiceMock.Setup(s => s.GetProductByIdAsync(product.Id, default))
                .ReturnsAsync(null as Product);

            var result = await ProductsController.DeleteProduct(product.Id, default);

            _productServiceMock.Verify(s => s.GetProductByIdAsync(product.Id, default), Times.Once);
            _productServiceMock.Verify(s => s.DeleteProductAsync(product, default), Times.Never);
            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async void DeleteProducts_DeletesProductsSuccessfully_WhenAllProductsWithRequestedIdsExist()
        {
            var productsForDelete = _fixture.CreateMany<Product>();
            var productsForDeleteIds = productsForDelete.Select(p => p.Id);

            _productServiceMock.Setup(s => s.GetProductsByIdsAsync(productsForDeleteIds, default))
                .ReturnsAsync(productsForDelete);
            _productServiceMock.Setup(s => s.AreAllProductsFetched(productsForDelete, productsForDeleteIds))
                .Returns(true);

            var result = await ProductsController.DeleteProducts(productsForDeleteIds, default);

            _productServiceMock.Verify(s => s.GetProductsByIdsAsync(productsForDeleteIds, default), Times.Once);
            _productServiceMock.Verify(s => s.AreAllProductsFetched(productsForDelete, productsForDeleteIds), Times.Once);
            _productServiceMock.Verify(s => s.DeleteProductsRangeAsync(productsForDelete, default), Times.Once);
            result.Should().BeOfType<OkResult>();
        }

        [Fact]
        public async void DeleteProducts_ReturnsBadRequest_WhenAtLeastOneRequestedProductDoesNotExist()
        {
            var productsForDelete = _fixture.CreateMany<Product>();
            var productsForDeleteIds = productsForDelete.Select(p => p.Id);

            _productServiceMock.Setup(s => s.GetProductsByIdsAsync(productsForDeleteIds, default))
                .ReturnsAsync(productsForDelete);
            _productServiceMock.Setup(s => s.AreAllProductsFetched(productsForDelete, productsForDeleteIds))
                .Returns(false);

            var result = await ProductsController.DeleteProducts(productsForDeleteIds, default);

            _productServiceMock.Verify(s => s.GetProductsByIdsAsync(productsForDeleteIds, default), Times.Once);
            _productServiceMock.Verify(s => s.AreAllProductsFetched(productsForDelete, productsForDeleteIds), Times.Once);
            _productServiceMock.Verify(s => s.DeleteProductsRangeAsync(productsForDelete, default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async void GetProductsDropdownList_ReturnsRequestedProducts()
        {
            var request = _fixture.Create<ProductDropdownSearchRequest>();
            var expectedProducts = _fixture.CreateMany<Product>();
            _productServiceMock.Setup(s => s.GetProductsDropdownListAsync(request, default))
                .ReturnsAsync(expectedProducts);

            var result = await ProductsController.GetProductsDropdownList(request, default);

            _productServiceMock.Verify(s => s.GetProductsDropdownListAsync(request, default), Times.Once);
            result.Should().BeOfType<OkObjectResult>();
        }
    }
}
