using System.Linq;
using System.Reflection;
using AutoFixture;
using AutoFixture.Xunit2;
using AutoMapper;
using FluentAssertions;
using FoodDiary.API;
using FoodDiary.API.Controllers.v1;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Services;
using FoodDiary.UnitTests.Customizations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace FoodDiary.UnitTests.Controllers
{
    public class ProductsControllerTests
    {
        private readonly ILoggerFactory _loggerFactory;

        private readonly IMapper _mapper;

        private readonly Mock<IProductService> _productServiceMock;
        private readonly Mock<ICategoryService> _categoryServiceMock;

        private readonly IFixture _fixture;

        public ProductsControllerTests()
        {
            var serviceProvider = new ServiceCollection()
                .AddLogging()
                .AddAutoMapper(Assembly.GetAssembly(typeof(AutoMapperProfile)))
                .BuildServiceProvider();

            _loggerFactory = serviceProvider.GetService<ILoggerFactory>();
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

        public ProductsController ProductsController => new ProductsController(_loggerFactory, _mapper, _productServiceMock.Object, _categoryServiceMock.Object);

        [Theory]
        [InlineAutoData]
        public async void GetProducts_ReturnsFilteredProductsWithPaginationInfo_WhenModelStateIsValid_AndCategoryExists(int categoryId)
        {
            var searchRequest = _fixture.Build<ProductsSearchRequestDto>()
                .With(r => r.CategoryId, categoryId)
                .Create();
            var requestedCategory = _fixture.Create<Category>();
            _categoryServiceMock.Setup(s => s.GetCategoryByIdAsync(categoryId, default))
                .ReturnsAsync(requestedCategory);

            var result = await ProductsController.GetProducts(searchRequest, default);

            _categoryServiceMock.Verify(s => s.GetCategoryByIdAsync(categoryId, default), Times.Once);
            _productServiceMock.Verify(s => s.CountAllProductsAsync(default), Times.Once);
            _productServiceMock.Verify(s => s.SearchProductsAsync(searchRequest, default), Times.Once);
            result.Should().BeOfType<OkObjectResult>();
        }

        [Fact]
        public async void GetProducts_ReturnsFilteredProductsWithPaginationInfo_WhenModelStateIsValid_AndCategoryIsEmpty()
        {
            var searchRequest = _fixture.Build<ProductsSearchRequestDto>()
                .With(r => r.CategoryId, null as int?)
                .Create();

            var result = await ProductsController.GetProducts(searchRequest, default);

            _categoryServiceMock.Verify(s => s.GetCategoryByIdAsync(It.IsAny<int>(), default), Times.Never);
            _productServiceMock.Verify(s => s.CountAllProductsAsync(default), Times.Once);
            _productServiceMock.Verify(s => s.SearchProductsAsync(searchRequest, default), Times.Once);
            result.Should().BeOfType<OkObjectResult>();
        }

        [Fact]
        public async void GetProducts_ReturnsBadRequest_WhenModelStateIsInvalid()
        {
            var searchRequest = _fixture.Create<ProductsSearchRequestDto>();
            var controller = ProductsController;
            controller.ModelState.AddModelError(_fixture.Create<string>(), _fixture.Create<string>());

            var result = await controller.GetProducts(searchRequest, default);

            _categoryServiceMock.Verify(s => s.GetCategoryByIdAsync(It.IsAny<int>(), default), Times.Never);
            _productServiceMock.Verify(s => s.CountAllProductsAsync(default), Times.Never);
            _productServiceMock.Verify(s => s.SearchProductsAsync(searchRequest, default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [InlineAutoData]
        public async void GetProducts_ReturnsNotFound_WhenCategoryNotFound(int categoryId)
        {
            var searchRequest = _fixture.Build<ProductsSearchRequestDto>()
                .With(r => r.CategoryId, categoryId)
                .Create();
            _categoryServiceMock.Setup(s => s.GetCategoryByIdAsync(categoryId, default))
                .ReturnsAsync(null as Category);

            var result = await ProductsController.GetProducts(searchRequest, default);

            _categoryServiceMock.Verify(s => s.GetCategoryByIdAsync(categoryId, default), Times.Once);
            _productServiceMock.Verify(s => s.CountAllProductsAsync(default), Times.Never);
            _productServiceMock.Verify(s => s.SearchProductsAsync(searchRequest, default), Times.Never);
            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async void CreateProduct_CreatesProductSuccessfully_WhenProductDataIsValid()
        {
            var productData = _fixture.Create<ProductCreateEditDto>();
            var productValidationResult = _fixture.Build<ValidationResultDto>()
                .With(v => v.IsValid, true)
                .Create();
            _productServiceMock.Setup(s => s.ValidateProductAsync(productData, default))
                .ReturnsAsync(productValidationResult);

            var result = await ProductsController.CreateProduct(productData, default);

            _productServiceMock.Verify(s => s.ValidateProductAsync(productData, default), Times.Once);
            _productServiceMock.Verify(s => s.CreateProductAsync(It.IsNotNull<Product>(), default), Times.Once);
            result.Should().BeOfType<OkResult>();
        }

        [Fact]
        public async void CreateProduct_ReturnsBadRequest_WhenModelStateIsInvalid()
        {
            var productData = _fixture.Create<ProductCreateEditDto>();
            var controller = ProductsController;
            controller.ModelState.AddModelError("error", "error");

            var result = await controller.CreateProduct(productData, default);

            _productServiceMock.Verify(s => s.ValidateProductAsync(productData, default), Times.Never);
            _productServiceMock.Verify(s => s.CreateProductAsync(It.IsNotNull<Product>(), default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async void EditProduct_UpdatesProductSuccessfully_WhenProductDataIsValid()
        {
            var productId = _fixture.Create<int>();
            var productData = _fixture.Create<ProductCreateEditDto>();
            var originalProduct = _fixture.Create<Product>();
            var productValidationResult = _fixture.Build<ValidationResultDto>()
                .With(v => v.IsValid, true)
                .Create();
            _productServiceMock.Setup(s => s.GetProductByIdAsync(productId, default))
                .ReturnsAsync(originalProduct);
            _productServiceMock.Setup(s => s.ValidateProductAsync(productData, default))
                .ReturnsAsync(productValidationResult);
            _productServiceMock.Setup(s => s.IsEditedProductValid(productData, originalProduct, productValidationResult))
                .Returns(true);

            var result = await ProductsController.EditProduct(productId, productData, default);

            _productServiceMock.Verify(s => s.GetProductByIdAsync(productId, default), Times.Once);
            _productServiceMock.Verify(s => s.ValidateProductAsync(productData, default), Times.Once);
            _productServiceMock.Verify(s => s.IsEditedProductValid(productData, originalProduct, productValidationResult), Times.Once);
            _productServiceMock.Verify(s => s.EditProductAsync(It.IsNotNull<Product>(), default), Times.Once);
            result.Should().BeOfType<OkResult>();
        }

        [Fact]
        public async void EditProduct_ReturnsBadRequest_WhenModelStateIsInvalid()
        {
            var productId = _fixture.Create<int>();
            var productData = _fixture.Create<ProductCreateEditDto>();
            var controller = ProductsController;
            controller.ModelState.AddModelError("error", "error");

            var result = await controller.EditProduct(productId, productData, default);

            _productServiceMock.Verify(s => s.GetProductByIdAsync(It.IsAny<int>(), default), Times.Never);
            _productServiceMock.Verify(s => s.ValidateProductAsync(productData, default), Times.Never);
            _productServiceMock.Verify(s => s.IsEditedProductValid(productData, It.IsAny<Product>(), It.IsAny<ValidationResultDto>()), Times.Never);
            _productServiceMock.Verify(s => s.EditProductAsync(It.IsNotNull<Product>(), default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async void EditProduct_ReturnsNotFound_WhenRequestedProductDoesNotExist()
        {
            var productId = _fixture.Create<int>();
            var productData = _fixture.Create<ProductCreateEditDto>();
            _productServiceMock.Setup(s => s.GetProductByIdAsync(It.IsAny<int>(), default))
                .ReturnsAsync(null as Product);

            var result = await ProductsController.EditProduct(productId, productData, default);

            _productServiceMock.Verify(s => s.GetProductByIdAsync(It.IsAny<int>(), default), Times.Once);
            _productServiceMock.Verify(s => s.ValidateProductAsync(productData, default), Times.Never);
            _productServiceMock.Verify(s => s.IsEditedProductValid(productData, It.IsAny<Product>(), It.IsAny<ValidationResultDto>()), Times.Never);
            _productServiceMock.Verify(s => s.EditProductAsync(It.IsNotNull<Product>(), default), Times.Never);
            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async void EditProduct_ReturnsBadRequest_WhenProductDataIsInvalid()
        {
            var productId = _fixture.Create<int>();
            var productData = _fixture.Create<ProductCreateEditDto>();
            var originalProduct = _fixture.Create<Product>();
            var productValidationResult = _fixture.Build<ValidationResultDto>()
                .With(v => v.IsValid, false)
                .Create();
            _productServiceMock.Setup(s => s.GetProductByIdAsync(productId, default))
                .ReturnsAsync(originalProduct);
            _productServiceMock.Setup(s => s.ValidateProductAsync(productData, default))
                .ReturnsAsync(productValidationResult);
            _productServiceMock.Setup(s => s.IsEditedProductValid(productData, originalProduct, productValidationResult))
                .Returns(false);

            var result = await ProductsController.EditProduct(productId, productData, default);

            _productServiceMock.Verify(s => s.GetProductByIdAsync(productId, default), Times.Once);
            _productServiceMock.Verify(s => s.ValidateProductAsync(productData, default), Times.Once);
            _productServiceMock.Verify(s => s.IsEditedProductValid(productData, originalProduct, productValidationResult), Times.Once);
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
            var expectedValidationResult = _fixture.Build<ValidationResultDto>()
                .With(r => r.IsValid, true)
                .Create();
            _productServiceMock.Setup(s => s.GetProductsByIdsAsync(productsForDeleteIds, default))
                .ReturnsAsync(productsForDelete);
            _productServiceMock.Setup(s => s.AllProductsFetched(productsForDelete, productsForDeleteIds))
                .Returns(expectedValidationResult);

            var result = await ProductsController.DeleteProducts(productsForDeleteIds, default);

            _productServiceMock.Verify(s => s.GetProductsByIdsAsync(productsForDeleteIds, default), Times.Once);
            _productServiceMock.Verify(s => s.AllProductsFetched(productsForDelete, productsForDeleteIds), Times.Once);
            _productServiceMock.Verify(s => s.DeleteProductsRangeAsync(productsForDelete, default), Times.Once);
            result.Should().BeOfType<OkResult>();
        }

        [Fact]
        public async void DeleteProducts_ReturnsBadRequest_WhenAtLeastOneRequestedProductDoesNotExist()
        {
            var productsForDelete = _fixture.CreateMany<Product>();
            var productsForDeleteIds = productsForDelete.Select(p => p.Id);
            var expectedValidationResult = _fixture.Build<ValidationResultDto>()
                .With(r => r.IsValid, false)
                .Create();
            _productServiceMock.Setup(s => s.GetProductsByIdsAsync(productsForDeleteIds, default))
                .ReturnsAsync(productsForDelete);
            _productServiceMock.Setup(s => s.AllProductsFetched(productsForDelete, productsForDeleteIds))
                .Returns(expectedValidationResult);

            var result = await ProductsController.DeleteProducts(productsForDeleteIds, default);

            _productServiceMock.Verify(s => s.GetProductsByIdsAsync(productsForDeleteIds, default), Times.Once);
            _productServiceMock.Verify(s => s.AllProductsFetched(productsForDelete, productsForDeleteIds), Times.Once);
            _productServiceMock.Verify(s => s.DeleteProductsRangeAsync(productsForDelete, default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async void GetProductsDropdownList_ReturnsRequestedProducts()
        {
            var request = _fixture.Create<ProductDropdownSearchRequestDto>();
            var expectedProducts = _fixture.CreateMany<Product>();
            _productServiceMock.Setup(s => s.GetProductsDropdownListAsync(request, default))
                .ReturnsAsync(expectedProducts);

            var result = await ProductsController.GetProductsDropdownList(request, default);

            _productServiceMock.Verify(s => s.GetProductsDropdownListAsync(request, default), Times.Once);
            result.Should().BeOfType<OkObjectResult>();
        }
    }
}
