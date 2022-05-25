using System.Collections.Generic;
using AutoFixture;
using FluentAssertions;
using FoodDiary.Contracts.Export.Json;
using FoodDiary.Domain.Entities;
using FoodDiary.Import.Implementation;
using FoodDiary.Import.Services;
using FoodDiary.Import.UnitTests.Attributes;
using Moq;
using Xunit;

namespace FoodDiary.Import.UnitTests.Services
{
    public class ProductJsonImporterTests
    {
        private readonly Mock<IJsonImportDataProvider> _importDataProviderMock;
        private readonly Mock<ICategoryJsonImporter> _categoryJsonImporterMock;

        private readonly IFixture _fixture = Fixtures.Custom;

        public ProductJsonImporterTests()
        {
            _importDataProviderMock = new Mock<IJsonImportDataProvider>();
            _categoryJsonImporterMock = new Mock<ICategoryJsonImporter>();
        }

        IProductJsonImporter Sut => new ProductJsonImporter(
            _importDataProviderMock.Object,
            _categoryJsonImporterMock.Object);

        [Theory]
        [ImportNotExistingProductAutoData]
        public void ImportProduct_CreatesNewProduct_WhenProductDoesNotExist(Dictionary<string, Product> existingProductsDictionary, JsonExportProductDto productFromJson)
        {
            var importedCategory = _fixture.Create<Category>();

            _importDataProviderMock.SetupGet(p => p.ExistingProducts)
                .Returns(existingProductsDictionary);
            _categoryJsonImporterMock.Setup(i => i.ImportCategory(productFromJson.Category))
                .Returns(importedCategory);

            var importedProductEntity = Sut.ImportProduct(productFromJson);

            _importDataProviderMock.VerifyGet(p => p.ExistingProducts, Times.Once);
            _categoryJsonImporterMock.Verify(i => i.ImportCategory(productFromJson.Category), Times.Once);

            importedProductEntity.Id.Should().Be(default);
            importedProductEntity.Name.Should().Be(productFromJson.Name);
            importedProductEntity.CaloriesCost.Should().Be(productFromJson.CaloriesCost);
            importedProductEntity.Category.Should().Be(importedCategory);
            existingProductsDictionary.Should().ContainKey(productFromJson.Name);
        }

        [Theory]
        [ImportExistingProductAutoData]
        public void ImportProduct_UpdatesExistingProduct_WhenProductExists(Dictionary<string, Product> existingProductsDictionary, JsonExportProductDto productFromJson)
        {
            var importedCategory = _fixture.Create<Category>();

            _importDataProviderMock.SetupGet(p => p.ExistingProducts)
                .Returns(existingProductsDictionary);
            _categoryJsonImporterMock.Setup(i => i.ImportCategory(productFromJson.Category))
                .Returns(importedCategory);

            var importedProductEntity = Sut.ImportProduct(productFromJson);

            _importDataProviderMock.VerifyGet(p => p.ExistingProducts, Times.Once);
            _categoryJsonImporterMock.Verify(i => i.ImportCategory(productFromJson.Category), Times.Once);

            importedProductEntity.Id.Should().NotBe(default);
            importedProductEntity.Name.Should().Be(productFromJson.Name);
            importedProductEntity.CaloriesCost.Should().Be(productFromJson.CaloriesCost);
            importedProductEntity.Category.Should().Be(importedCategory);
        }
    }
}
