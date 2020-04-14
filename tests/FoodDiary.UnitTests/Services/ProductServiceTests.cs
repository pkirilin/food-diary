using System;
using System.Collections.Generic;
using System.Linq;
using AutoFixture;
using AutoFixture.Xunit2;
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
    public class ProductServiceTests
    {
        private readonly Mock<IProductRepository> _productRepositoryMock;

        private readonly IFixture _fixture;

        public ProductServiceTests()
        {
            _productRepositoryMock = new Mock<IProductRepository>();
            _fixture = SetupFixture();
        }

        public IProductService ProductService => new ProductService(_productRepositoryMock.Object);

        private IFixture SetupFixture()
        {
            var _fixture = new Fixture();
            _fixture.Customize(new FixtureWithCircularReferencesCustomization());
            return _fixture;
        }

        private IQueryable<Product> GetQueryModifiedBySearchRequest(IQueryable<Product> sourceQuery, ProductsSearchRequestDto searchRequest)
        {
            var modifiedQuery = new List<Product>(sourceQuery.ToList()).AsQueryable();

            if (!String.IsNullOrWhiteSpace(searchRequest.ProductSearchName))
            {
                modifiedQuery = modifiedQuery.Where(p =>
                    p.Name.ToLower()
                        .StartsWith(searchRequest.ProductSearchName.ToLower()));
            }

            if (searchRequest.CategoryId.HasValue)
            {
                modifiedQuery = modifiedQuery.Where(p => p.CategoryId == searchRequest.CategoryId);
            }

            modifiedQuery = modifiedQuery.Skip((searchRequest.PageNumber - 1) * searchRequest.PageSize)
                .Take(searchRequest.PageSize);
            return modifiedQuery;
        }

        [Theory]
        [InlineData(100, 0, 10)]
        [InlineData(5, 1, 10)]
        [InlineData(100, 1, 10)]
        [InlineData(100, 1, 10, "", null, 0, 0)]
        [InlineData(100, 1, 10, " ", null, 0, 0)]
        [InlineData(100, 1, 10, "Test product", null, 3, 0)]
        [InlineData(100, 1, 10, null, 1, 0, 3)]
        [InlineData(100, 1, 10, "Test product", 1, 3, 3)]
        public async void SearchProductsAsync_ReturnsFilteredProducts(
            int productsCount,
            int pageIndex,
            int pageSize,
            string productSearchName = null,
            int? categoryId = null,
            int productsWithSearchNameCount = 0,
            int productsWithCategoryIdCount = 0)
        {
            var searchRequest = _fixture.Build<ProductsSearchRequestDto>()
                .With(r => r.PageNumber, pageIndex)
                .With(r => r.PageSize, pageSize)
                .With(r => r.ProductSearchName, productSearchName)
                .With(r => r.CategoryId, categoryId)
                .Create();

            var productsList = _fixture.CreateMany<Product>(productsCount);

            var productsListWithSearchName = _fixture.Build<Product>()
                .With(p => p.Name, productSearchName)
                .CreateMany(productsWithSearchNameCount);

            var productsListWithCategoryId = _fixture.Build<Product>()
                .With(p => p.CategoryId, categoryId)
                .CreateMany(productsWithCategoryIdCount);

            var searchQuery = productsList.Concat(productsListWithSearchName)
                .Concat(productsListWithCategoryId)
                .AsQueryable();

            var modifiedSearchQuery = GetQueryModifiedBySearchRequest(searchQuery, searchRequest);
            var expectedProductsResult = modifiedSearchQuery.ToList();

            _productRepositoryMock.Setup(r => r.GetQueryWithoutTracking())
                .Returns(searchQuery);
            _productRepositoryMock.Setup(r => r.LoadCategory(It.IsNotNull<IQueryable<Product>>()))
                .Returns(modifiedSearchQuery);
            _productRepositoryMock.Setup(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Product>>(), default))
                .ReturnsAsync(expectedProductsResult);

            var result = await ProductService.SearchProductsAsync(searchRequest, default);

            _productRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _productRepositoryMock.Verify(r => r.LoadCategory(It.IsNotNull<IQueryable<Product>>()), Times.Once);
            _productRepositoryMock.Verify(r => r.GetListFromQueryAsync(modifiedSearchQuery, default), Times.Once);

            if (!expectedProductsResult.Any())
                result.Should().BeEmpty();
            else
                result.Should().Contain(expectedProductsResult);
        }

        [Fact]
        public async void GetProductById_ReturnsRequestedProduct()
        {
            var product = _fixture.Create<Product>();
            _productRepositoryMock.Setup(r => r.GetByIdAsync(product.Id, default))
                .ReturnsAsync(product);

            var result = await ProductService.GetProductByIdAsync(product.Id, default);

            _productRepositoryMock.Verify(r => r.GetByIdAsync(product.Id, default), Times.Once);
            result.Should().Be(product);
        }

        [Fact]
        public async void GetProductsByIds_ReturnsRequestedProducts()
        {
            var products = _fixture.CreateMany<Product>();
            var productsIds = products.Select(p => p.Id);
            _productRepositoryMock.Setup(r => r.GetByIdsAsync(productsIds, default))
                .ReturnsAsync(products);

            var result = await ProductService.GetProductsByIdsAsync(productsIds, default);

            _productRepositoryMock.Verify(r => r.GetByIdsAsync(productsIds, default), Times.Once);
            result.Should().Contain(products);
        }

        [Fact]
        public async void ValidateProduct_ReturnsValidationResultWithError_WhenGivenProductAlreadyExists()
        {
            var productData = _fixture.Create<ProductCreateEditDto>();
            _productRepositoryMock.Setup(r => r.IsDuplicateAsync(productData.Name, default))
                .ReturnsAsync(true);

            var result = await ProductService.ValidateProductAsync(productData, default);

            _productRepositoryMock.Verify(r => r.IsDuplicateAsync(productData.Name, default), Times.Once);
            result.IsValid.Should().BeFalse();
        }

        [Theory]
        [InlineData("Some name", "Some new name", true)]
        [InlineData("Some name", "Some name", true)]
        public void IsEditedProductValid_ReturnsTrue_WhenProductIsValidAfterItWasEdited(
            string oldProductName,
            string newProductName,
            bool isValid)
        {
            var originalProduct = _fixture.Build<Product>()
                .With(p => p.Name, oldProductName)
                .Create();
            var editedProductData = _fixture.Build<ProductCreateEditDto>()
                .With(p => p.Name, newProductName)
                .Create();
            var validationResult = _fixture.Build<ValidationResultDto>()
                .With(r => r.IsValid, isValid)
                .Create();

            var result = ProductService.IsEditedProductValid(editedProductData, originalProduct, validationResult);

            result.Should().BeTrue();
        }

        [Fact]
        public async void CreateProduct_CreatesProductWithoutErrors()
        {
            var product = _fixture.Create<Product>();
            _productRepositoryMock.Setup(r => r.Create(product))
                .Returns(product);

            var result = await ProductService.CreateProductAsync(product, default);

            _productRepositoryMock.Verify(r => r.Create(product), Times.Once);
            _productRepositoryMock.Verify(r => r.SaveChangesAsync(default), Times.Once);
            result.Should().Be(product);
        }

        [Fact]
        public async void EditProduct_UpdatesProductWithoutErrors()
        {
            var product = _fixture.Create<Product>();
            _productRepositoryMock.Setup(r => r.Update(product))
                .Returns(product);

            var result = await ProductService.EditProductAsync(product, default);

            _productRepositoryMock.Verify(r => r.Update(product), Times.Once);
            _productRepositoryMock.Verify(r => r.SaveChangesAsync(default), Times.Once);
            result.Should().Be(product);
        }

        [Fact]
        public async void DeleteProduct_DeletesProductWithoutErrors()
        {
            var product = _fixture.Create<Product>();
            _productRepositoryMock.Setup(r => r.Delete(product))
                .Returns(product);

            var result = await ProductService.DeleteProductAsync(product, default);

            _productRepositoryMock.Verify(r => r.Delete(product), Times.Once);
            _productRepositoryMock.Verify(r => r.SaveChangesAsync(default), Times.Once);
            result.Should().Be(product);
        }

        [Fact]
        public async void DeleteProducts_DeletesMultipleProductsWithoutErrors()
        {
            var products = _fixture.CreateMany<Product>();

            await ProductService.DeleteProductsRangeAsync(products, default);

            _productRepositoryMock.Verify(r => r.DeleteRange(products), Times.Once);
            _productRepositoryMock.Verify(r => r.SaveChangesAsync(default), Times.Once);
        }

        [Fact]
        public async void GetProductsDropdownList_ReturnsAllProducts()
        {
            var expectedProducts = _fixture.CreateMany<Product>().ToList();
            _productRepositoryMock.Setup(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Product>>(), default))
                .ReturnsAsync(expectedProducts);

            var result = await ProductService.GetProductsDropdownListAsync(default);

            _productRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _productRepositoryMock.Verify(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Product>>(), default), Times.Once);
            result.Should().Contain(expectedProducts);
        }
    }
}
