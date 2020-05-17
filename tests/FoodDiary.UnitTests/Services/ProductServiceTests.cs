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
        [CustomAutoData]
        public async void SearchProducts_ReturnsFilteredProducts(
            ProductsSearchRequest request, ProductsSearchResultMetadata searchResult)
        {
            _productRepositoryMock.Setup(r => r.CountByQueryAsync(It.IsNotNull<IQueryable<Product>>(), default))
                .ReturnsAsync(searchResult.TotalProductsCount);

            _productRepositoryMock.Setup(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Product>>(), default))
                .ReturnsAsync(searchResult.FoundProducts.ToList());

            var result = await Sut.SearchProductsAsync(request, default);

            _productRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _productRepositoryMock.Verify(r => r.LoadCategory(It.IsNotNull<IQueryable<Product>>()), Times.Once);
            _productRepositoryMock.Verify(r => r.CountByQueryAsync(It.IsNotNull<IQueryable<Product>>(), default), Times.Once);
            _productRepositoryMock.Verify(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Product>>(), default), Times.Once);

            result.Should().BeEquivalentTo(searchResult);
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
        [CustomAutoData]
        public async void IsProductExists_ReturnsTrue_WhenProductWithTheSameNameAlreadyExists(
            ProductCreateEditRequest request, List<Product> productsWithTheSameName)
        {
            _productRepositoryMock.Setup(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Product>>(), default))
                .ReturnsAsync(productsWithTheSameName);

            var result = await Sut.IsProductExistsAsync(request.Name, default);

            _productRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _productRepositoryMock.Verify(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Product>>(), default), Times.Once);
            
            result.Should().BeTrue();
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
        [CustomAutoData]
        public async void GetProductsDropdown_ReturnsAllProducts(
            ProductDropdownSearchRequest request, List<Product> products)
        {
            _productRepositoryMock.Setup(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Product>>(), default))
                .ReturnsAsync(products);

            var result = await Sut.GetProductsDropdownAsync(request, default);

            _productRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _productRepositoryMock.Verify(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Product>>(), default), Times.Once);
            
            result.Should().Contain(products);
        }
    }
}
