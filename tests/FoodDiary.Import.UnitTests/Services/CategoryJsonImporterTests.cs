using System.Collections.Generic;
using AutoFixture;
using FluentAssertions;
using FoodDiary.Domain.Entities;
using FoodDiary.Import.Implementation;
using FoodDiary.Import.Services;
using FoodDiary.Import.UnitTests.Attributes;
using FoodDiary.UnitTests.Customizations;
using Moq;
using Xunit;

namespace FoodDiary.Import.UnitTests.Services
{
    public class CategoryJsonImporterTests
    {
        private readonly Mock<IJsonImportDataProvider> _importDataProviderMock;

        public CategoryJsonImporterTests()
        {
            _importDataProviderMock = new Mock<IJsonImportDataProvider>();
        }

        ICategoryJsonImporter Sut => new CategoryJsonImporter(_importDataProviderMock.Object);

        [Theory]
        [ImportNotExistingCategoryAutoData]
        public void ImportCategory_CreatesNewCategory_WhenCategoryDoesNotExist(Dictionary<string, Category> existingCategoriesDictionary, string categoryNameFromJson)
        {
            _importDataProviderMock.SetupGet(p => p.ExistingCategories)
                .Returns(existingCategoriesDictionary);

            var importedCategory = Sut.ImportCategory(categoryNameFromJson);

            importedCategory.Id.Should().Be(default);
            importedCategory.Name.Should().Be(categoryNameFromJson);
            existingCategoriesDictionary.Should().ContainKey(categoryNameFromJson);
        }

        [Theory]
        [ImportExistingCategoryAutoData]
        public void ImportCategory_UpdatesExistingCategory_WhenCategoryExists(Dictionary<string, Category> existingCategoriesDictionary, string categoryNameFromJson)
        {
            _importDataProviderMock.SetupGet(p => p.ExistingCategories)
                .Returns(existingCategoriesDictionary);

            var importedCategory = Sut.ImportCategory(categoryNameFromJson);

            _importDataProviderMock.VerifyGet(p => p.ExistingCategories, Times.Once);

            importedCategory.Id.Should().NotBe(default);
            importedCategory.Name.Should().Be(categoryNameFromJson);
        }
    }
}
