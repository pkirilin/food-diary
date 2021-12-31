﻿using System;
using System.Collections.Generic;
using System.Linq;
using AutoFixture;
using FluentAssertions;
using FoodDiary.Domain.Entities;
using FoodDiary.Import.Implementation;
using FoodDiary.Import.Models;
using FoodDiary.Import.Services;
using FoodDiary.Import.UnitTests.Attributes;
using Moq;
using Xunit;

namespace FoodDiary.Import.UnitTests.Services
{
    public class PageJsonImporterTests
    {
        private readonly Mock<IJsonImportDataProvider> _importDataProviderMock;
        private readonly Mock<INoteJsonImporter> _noteJsonImporterMock;

        private readonly IFixture _fixture = Fixtures.Custom;

        public PageJsonImporterTests()
        {
            _importDataProviderMock = new Mock<IJsonImportDataProvider>();
            _noteJsonImporterMock = new Mock<INoteJsonImporter>();
        }

        IPageJsonImporter Sut => new PageJsonImporter(
            _importDataProviderMock.Object,
            _noteJsonImporterMock.Object);

        [Theory]
        [ImportNotExistingPageAutoData]
        public void ImportPage_CreatesNewPage_WhenPageDoesNotExist(Dictionary<DateTime, Page> existingPagesDictionary, PageJsonItem pageFromJson)
        {
            var importedNoteEntity = _fixture.Create<Note>();
            var expectedCreatedPageNotes = Enumerable.Repeat(importedNoteEntity, pageFromJson.Notes.Count()).ToList();

            _importDataProviderMock.SetupGet(p => p.ExistingPages)
                .Returns(existingPagesDictionary);
            _noteJsonImporterMock.Setup(i => i.ImportNote(It.IsIn(pageFromJson.Notes)))
                .Returns(importedNoteEntity);

            Sut.ImportPage(pageFromJson, out var createdPage);

            _importDataProviderMock.VerifyGet(p => p.ExistingPages, Times.Once);
            _noteJsonImporterMock.Verify(i => i.ImportNote(It.IsIn(pageFromJson.Notes)), Times.Exactly(pageFromJson.Notes.Count()));

            createdPage.Id.Should().Be(default);
            createdPage.Date.Should().Be(DateTime.Parse(pageFromJson.Date.ToShortDateString()));
            createdPage.Notes.Should().Contain(expectedCreatedPageNotes);
        }

        [Theory]
        [ImportExistingPageAutoData]
        public void ImportPage_UpdatesExistingPage_WhenPageExists(Dictionary<DateTime, Page> existingPagesDictionary, PageJsonItem pageFromJson)
        {
            var importedNoteEntity = _fixture.Create<Note>();
            var expectedCreatedPageNotes = Enumerable.Repeat(importedNoteEntity, pageFromJson.Notes.Count()).ToList();

            _importDataProviderMock.SetupGet(p => p.ExistingPages)
                .Returns(existingPagesDictionary);
            _noteJsonImporterMock.Setup(i => i.ImportNote(It.IsIn(pageFromJson.Notes)))
                .Returns(importedNoteEntity);

            Sut.ImportPage(pageFromJson, out var createdPage);

            _importDataProviderMock.VerifyGet(p => p.ExistingPages, Times.Once);
            _noteJsonImporterMock.Verify(i => i.ImportNote(It.IsIn(pageFromJson.Notes)), Times.Exactly(pageFromJson.Notes.Count()));

            createdPage.Should().BeNull();
            existingPagesDictionary[pageFromJson.Date].Notes.Should().Contain(expectedCreatedPageNotes);
        }
    }
}
