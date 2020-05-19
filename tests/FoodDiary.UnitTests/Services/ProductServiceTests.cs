using System.Collections.Generic;
using System.Linq;
using AutoFixture;
using FluentAssertions;
using FoodDiary.API.Services;
using FoodDiary.API.Services.Implementation;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using Moq;
using Xunit;
using FoodDiary.API.Requests;
using FoodDiary.UnitTests.Attributes;
using FoodDiary.API.Metadata;
using FoodDiary.UnitTests.Services.TestData;

namespace FoodDiary.UnitTests.Services
{
    public class ProductServiceTests
    {
        private readonly Mock<IProductRepository> _productRepositoryMock;

        private readonly IFixture _fixture = Fixtures.Custom;

        public ProductServiceTests()
        {
            _productRepositoryMock = new Mock<IProductRepository>();

            _productRepositoryMock.SetupGet(r => r.UnitOfWork)
                .Returns(new Mock<IUnitOfWork>().Object);
        }

        public IProductService Sut => new ProductService(_productRepositoryMock.Object);

        [Theory]
        [MemberData(nameof(ProductServiceTestData.SearchProducts), MemberType = typeof(ProductServiceTestData))]
        public async void SearchProducts_ReturnsFilteredProducts(
            ProductsSearchRequest request,
            List<Product> sourceProducts,
            ProductsSearchResultMetadata searchResult)
        {
            var resultProductsQuery = searchResult.FoundProducts.AsQueryable();

            _productRepositoryMock.Setup(r => r.CountByQueryAsync(It.IsNotNull<IQueryable<Product>>(), default))
                .ReturnsAsync(searchResult.TotalProductsCount);

            _productRepositoryMock.Setup(r => r.GetQueryWithoutTracking())
                .Returns(sourceProducts.AsQueryable());

            _productRepositoryMock.Setup(r => r.LoadCategory(resultProductsQuery))
                .Returns(resultProductsQuery);

            _productRepositoryMock.Setup(r => r.GetListFromQueryAsync(resultProductsQuery, default))
                .ReturnsAsync(searchResult.FoundProducts.ToList());

            var result = await Sut.SearchProductsAsync(request, default);

            _productRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _productRepositoryMock.Verify(r => r.LoadCategory(resultProductsQuery), Times.Once);
            _productRepositoryMock.Verify(r => r.CountByQueryAsync(It.IsNotNull<IQueryable<Product>>(), default), Times.Once);
            _productRepositoryMock.Verify(r => r.GetListFromQueryAsync(resultProductsQuery, default), Times.Once);

            result.FoundProducts.Should()
                .ContainInOrder(searchResult.FoundProducts);

            result.TotalProductsCount.Should()
                .Be(searchResult.TotalProductsCount);
        }

        [Theory]
        [CustomAutoData]
        public async void GetProductById_ReturnsRequestedProduct(
            int productId, Product product)
        {
            _productRepositoryMock.Setup(r => r.GetByIdAsync(productId, default))
                .ReturnsAsync(product);

            var result = await Sut.GetProductByIdAsync(productId, default);

            _productRepositoryMock.Verify(r => r.GetByIdAsync(productId, default), Times.Once);
            
            result.Should().Be(product);
        }

        [Theory]
        [CustomAutoData]
        public async void GetProductsByIds_ReturnsRequestedProducts(
            IEnumerable<int> productsIds, List<Product> products)
        {
            _productRepositoryMock.Setup(r => r.GetByIdsAsync(productsIds, default))
                .ReturnsAsync(products);

            var result = await Sut.GetProductsByIdsAsync(productsIds, default);

            _productRepositoryMock.Verify(r => r.GetByIdsAsync(productsIds, default), Times.Once);
            
            result.Should().Contain(products);
        }

        [Theory]
        [MemberData(nameof(ProductServiceTestData.IsProductExists), MemberType = typeof(ProductServiceTestData))]
        public async void IsProductExists_ReturnsTrue_WhenProductWithTheSameNameAlreadyExists(
            string productSearchName,
            List<Product> sourceProducts,
            List<Product> productsWithTheSameName,
            bool expectedResult)
        {
            var productsWithTheSameNameQuery = productsWithTheSameName.AsQueryable();

            _productRepositoryMock.Setup(r => r.GetQueryWithoutTracking())
                .Returns(sourceProducts.AsQueryable());

            _productRepositoryMock.Setup(r => r.GetListFromQueryAsync(productsWithTheSameNameQuery, default))
                .ReturnsAsync(productsWithTheSameName);

            var result = await Sut.IsProductExistsAsync(productSearchName, default);

            _productRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _productRepositoryMock.Verify(r => r.GetListFromQueryAsync(productsWithTheSameNameQuery, default), Times.Once);
            
            result.Should().Be(expectedResult);
        }

        [Theory]
        [InlineData("Some name", "Some new name", false)]
        [InlineData("Some name", "Some name", true)]
        public void IsEditedProductValid_ReturnsTrue_WhenProductIsValidAfterItWasEdited(
            string oldProductName,
            string newProductName,
            bool isProductExists)
        {
            var originalProduct = _fixture.Build<Product>()
                .With(p => p.Name, oldProductName)
                .Create();
            var editedProductData = _fixture.Build<ProductCreateEditRequest>()
                .With(p => p.Name, newProductName)
                .Create();

            var result = Sut.IsEditedProductValid(editedProductData, originalProduct, isProductExists);

            result.Should().BeTrue();
        }

        [Theory]
        [CustomAutoData]
        public async void CreateProduct_CreatesProduct(Product product)
        {
            _productRepositoryMock.Setup(r => r.Create(product))
                .Returns(product);

            var result = await Sut.CreateProductAsync(product, default);

            _productRepositoryMock.Verify(r => r.Create(product), Times.Once);
            _productRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
            
            result.Should().Be(product);
        }

        [Theory]
        [CustomAutoData]
        public async void EditProduct_UpdatesProduct(Product product)
        {
            await Sut.EditProductAsync(product, default);

            _productRepositoryMock.Verify(r => r.Update(product), Times.Once);
            _productRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Theory]
        [CustomAutoData]
        public async void DeleteProduct_DeletesProduct(Product product)
        {
            await Sut.DeleteProductAsync(product, default);

            _productRepositoryMock.Verify(r => r.Delete(product), Times.Once);
            _productRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Theory]
        [CustomAutoData]
        public async void DeleteProducts_DeletesProducts(List<Product> products)
        {
            await Sut.DeleteProductsRangeAsync(products, default);

            _productRepositoryMock.Verify(r => r.DeleteRange(products), Times.Once);
            _productRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Theory]
        [MemberData(nameof(ProductServiceTestData.GetProductsDropdown), MemberType = typeof(ProductServiceTestData))]
        public async void GetProductsDropdown_ReturnsAllProducts(
            ProductDropdownSearchRequest request,
            List<Product> sourceProducts,
            List<Product> foundProducts)
        {
            var foundProductsQuery = foundProducts.AsQueryable();

            _productRepositoryMock.Setup(r => r.GetQueryWithoutTracking())
                .Returns(sourceProducts.AsQueryable());

            _productRepositoryMock.Setup(r => r.GetListFromQueryAsync(foundProductsQuery, default))
                .ReturnsAsync(foundProducts);

            var result = await Sut.GetProductsDropdownAsync(request, default);

            _productRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _productRepositoryMock.Verify(r => r.GetListFromQueryAsync(foundProductsQuery, default), Times.Once);
            
            result.Should().ContainInOrder(foundProducts);
        }
    }
}
