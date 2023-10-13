using AutoFixture;
using FluentAssertions;
using FoodDiary.Contracts.Export.Json;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;
using FoodDiary.Import.Implementation;
using FoodDiary.Import.Services;
using Moq;
using Xunit;

namespace FoodDiary.Import.UnitTests.Services
{
    public class NoteJsonImporterTests
    {
        private readonly Mock<IProductJsonImporter> _productJsonImporterMock;

        private readonly IFixture _fixture = Fixtures.Custom;

        public NoteJsonImporterTests()
        {
            _productJsonImporterMock = new Mock<IProductJsonImporter>();
        }

        INoteJsonImporter Sut => new NoteJsonImporter(_productJsonImporterMock.Object);

        [Fact]
        public void ImportNote_CreatesNoteEntityFromJson()
        {
            var noteFromJson = _fixture.Create<JsonExportNoteDto>();
            var importedProductEntity = _fixture.Create<Product>();

            _productJsonImporterMock.Setup(i => i.ImportProduct(noteFromJson.Product))
                .Returns(importedProductEntity);

            var importedNote = Sut.ImportNote(noteFromJson);

            _productJsonImporterMock.Verify(i => i.ImportProduct(noteFromJson.Product), Times.Once);

            importedNote.Id.Should().Be(default);
            importedNote.MealType.Should().Be((MealType)noteFromJson.MealType);
            importedNote.DisplayOrder.Should().Be(noteFromJson.DisplayOrder);
            importedNote.ProductQuantity.Should().Be(noteFromJson.ProductQuantity);
            importedNote.Product.Should().Be(importedProductEntity);
        }
    }
}
