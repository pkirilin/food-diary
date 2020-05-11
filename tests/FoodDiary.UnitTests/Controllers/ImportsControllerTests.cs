using System.IO;
using System.Threading;
using AutoFixture;
using FluentAssertions;
using FoodDiary.API.Controllers.v1;
using FoodDiary.API.Options;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Services;
using FoodDiary.UnitTests.Customizations;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace FoodDiary.UnitTests.Controllers
{
    public class ImportsControllerTests
    {
        const long IMPORT_OPTIONS_MAX_FILE_LENGTH = 1000;

        private readonly Mock<IOptions<ImportOptions>> _importOptionsMock;
        private readonly Mock<IImportService> _importServiceMock;
        private readonly Mock<IFormFile> _formFileMock;

        private readonly IFixture _fixture;

        public ImportsControllerTests()
        {
            _importOptionsMock = new Mock<IOptions<ImportOptions>>();
            _importServiceMock = new Mock<IImportService>();
            _formFileMock = new Mock<IFormFile>();
            _fixture = SetupFixture();
            SetupImportOptions();
        }

        public ImportsController Controller => new ImportsController(
            _importOptionsMock.Object,
            _importServiceMock.Object);

        private IFixture SetupFixture()
        {
            var _fixture = new Fixture();
            _fixture.Customize(new FixtureWithCircularReferencesCustomization());
            return _fixture;
        }

        private void SetupImportOptions()
        {
            var importOptionsValue = _fixture.Build<ImportOptions>()
                .With(o => o.MaxImportFileLengthBytes, IMPORT_OPTIONS_MAX_FILE_LENGTH)
                .Create();

            _importOptionsMock.Setup(o => o.Value)
                .Returns(importOptionsValue);
        }

        [Theory]
        [InlineData(IMPORT_OPTIONS_MAX_FILE_LENGTH - 1)]
        [InlineData(IMPORT_OPTIONS_MAX_FILE_LENGTH)]
        public async void ImportPagesJson_ReturnsOk_WhenImportIsSuccessful(long importFileLengthBytes)
        {
            var streamMock = new Mock<Stream>();
            var pagesJsonObject = _fixture.Create<PagesJsonObjectDto>();
            _formFileMock.SetupGet(f => f.Length)
                .Returns(importFileLengthBytes);
            _formFileMock.Setup(f => f.OpenReadStream())
                .Returns(streamMock.Object);
            _importServiceMock.Setup(s => s.DeserializePagesFromJsonAsync(streamMock.Object, CancellationToken.None))
                .ReturnsAsync(pagesJsonObject);

            var result = await Controller.ImportPagesJson(_formFileMock.Object, CancellationToken.None);

            _formFileMock.VerifyGet(f => f.Length, Times.Once);
            _formFileMock.Verify(f => f.OpenReadStream(), Times.Once);
            _importServiceMock.Verify(s => s.DeserializePagesFromJsonAsync(streamMock.Object, CancellationToken.None), Times.Once);
            _importServiceMock.Verify(s => s.RunPagesJsonImportAsync(pagesJsonObject, CancellationToken.None), Times.Once);
            result.Should().BeOfType<OkResult>();
        }

        [Fact]
        public async void ImportPagesJson_ReturnsBadRequest_WhenImportFileIsNotSpecified()
        {
            var result = await Controller.ImportPagesJson(null, CancellationToken.None);

            _formFileMock.VerifyGet(f => f.Length, Times.Never);
            _formFileMock.Verify(f => f.OpenReadStream(), Times.Never);
            _importServiceMock.Verify(s => s.DeserializePagesFromJsonAsync(It.IsAny<Stream>(), CancellationToken.None), Times.Never);
            _importServiceMock.Verify(s => s.RunPagesJsonImportAsync(It.IsAny<PagesJsonObjectDto>(), CancellationToken.None), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [InlineData(IMPORT_OPTIONS_MAX_FILE_LENGTH + 1)]
        public async void ImportPagesJson_ReturnsBadRequest_WhenImportFileIsLarge(long importFileLengthBytes)
        {
            _formFileMock.SetupGet(f => f.Length)
                .Returns(importFileLengthBytes);

            var result = await Controller.ImportPagesJson(_formFileMock.Object, CancellationToken.None);

            _formFileMock.VerifyGet(f => f.Length, Times.Once);
            _formFileMock.Verify(f => f.OpenReadStream(), Times.Never);
            _importServiceMock.Verify(s => s.DeserializePagesFromJsonAsync(It.IsAny<Stream>(), CancellationToken.None), Times.Never);
            _importServiceMock.Verify(s => s.RunPagesJsonImportAsync(It.IsAny<PagesJsonObjectDto>(), CancellationToken.None), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }
    }
}
