using AutoFixture;
using FluentAssertions;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;
using FoodDiary.Import.Implementation;
using FoodDiary.Import.Services;
using FoodDiary.UnitTests.Customizations;
using Moq;
using Xunit;

namespace FoodDiary.Import.UnitTests.Services
{
    public class NoteJsonImporterTests
    {
        private readonly Mock<IProductJsonImporter> _productJsonImporterMock;

        private readonly IFixture _fixture;

        public NoteJsonImporterTests()
        {
            _productJsonImporterMock = new Mock<IProductJsonImporter>();
            _fixture = SetupFixture();
        }

        INoteJsonImporter Sut => new NoteJsonImporter(_productJsonImporterMock.Object);

        private IFixture SetupFixture()
        {
            var _fixture = new Fixture();
            _fixture.Customize(new FixtureWithCircularReferencesCustomization());
            return _fixture;
        }

        [Fact]
        public void ImportNote_CreatesNoteEntityFromJson()
        {
            var noteFromJson = _fixture.Create<NoteJsonItemDto>();
            var importedProductEntity = _fixture.Create<Product>();

            _productJsonImporterMock.Setup(i => i.ImportProduct(noteFromJson.Product))
                .Returns(importedProductEntity);

            var importedNote = Sut.ImportNote(noteFromJson);

            _productJsonImporterMock.Verify(i => i.ImportProduct(noteFromJson.Product), Times.Once);

            importedNote.Id.Should().Be(default);
            importedNote.MealType.Should().Be(noteFromJson.MealType);
            importedNote.DisplayOrder.Should().Be(noteFromJson.DisplayOrder);
            importedNote.ProductQuantity.Should().Be(noteFromJson.ProductQuantity);
            importedNote.Product.Should().Be(importedProductEntity);
        }
    }
}
