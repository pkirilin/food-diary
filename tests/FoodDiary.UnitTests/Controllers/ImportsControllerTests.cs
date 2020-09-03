using System.Threading;
using AutoFixture;
using FluentAssertions;
using FoodDiary.API.Controllers.v1;
using FoodDiary.API.Options;
using FoodDiary.Application.Imports.Requests;
using MediatR;
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

        private readonly Mock<IOptions<ImportOptions>> _importOptionsMock = new Mock<IOptions<ImportOptions>>();
        private readonly Mock<IMediator> _mediatorMock = new Mock<IMediator>();
        private readonly Mock<IFormFile> _formFileMock = new Mock<IFormFile>();

        private readonly IFixture _fixture = Fixtures.Custom;

        public ImportsControllerTests()
        {
            SetupImportOptions();
        }

        public ImportsController Sut => new ImportsController(_importOptionsMock.Object, _mediatorMock.Object);

        private void SetupImportOptions()
        {
            var importOptionsValue = _fixture.Build<ImportOptions>()
                .With(o => o.MaxImportFileLengthBytes, IMPORT_OPTIONS_MAX_FILE_LENGTH)
                .Create();

            _importOptionsMock.Setup(o => o.Value)
                .Returns(importOptionsValue);
        }

        [Fact]
        public async void ImportPagesJson_ReturnsBadRequest_WhenImportFileIsNotSpecified()
        {
            var result = await Sut.ImportPagesJson(null, CancellationToken.None);

            _formFileMock.VerifyGet(f => f.Length, Times.Never);
            _formFileMock.Verify(f => f.OpenReadStream(), Times.Never);
            _mediatorMock.Verify(m => m.Send(It.IsAny<PagesJsonImportRequest>(), default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [InlineData(IMPORT_OPTIONS_MAX_FILE_LENGTH + 1)]
        public async void ImportPagesJson_ReturnsBadRequest_WhenImportFileIsLarge(long importFileLengthBytes)
        {
            _formFileMock.SetupGet(f => f.Length).Returns(importFileLengthBytes);

            var result = await Sut.ImportPagesJson(_formFileMock.Object, CancellationToken.None);

            _formFileMock.VerifyGet(f => f.Length, Times.Once);
            _formFileMock.Verify(f => f.OpenReadStream(), Times.Never);
            _mediatorMock.Verify(m => m.Send(It.IsAny<PagesJsonImportRequest>(), default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }
    }
}
