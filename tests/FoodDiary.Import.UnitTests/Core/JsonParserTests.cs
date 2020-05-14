﻿using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using FoodDiary.Domain.Exceptions;
using FoodDiary.Import.Core;
using FoodDiary.Import.Models;
using FoodDiary.Import.UnitTests.Attributes;
using Xunit;

namespace FoodDiary.Import.UnitTests.Core
{
    public class JsonParserTests
    {
        IJsonParser Sut => new JsonParser();

        [Theory]
        [JsonObjectWithUniquePagesAutoData]
        public void ParsePages_ReturnsJsonPages_WhenJsonContainsUniquePageDates(PagesJsonObject jsonObj)
        {
            var result = Sut.ParsePages(jsonObj);

            result.Should().Contain(jsonObj.Pages);
        }

        [Theory]
        [JsonObjectWithNullPagesAutoData]
        [JsonObjectWithDuplicatePageDatesAutoData]
        public void ParsePages_ThrowsImportException_WhenJsonDoesNotContainUniquePageDates(PagesJsonObject jsonObj)
        {
            Sut.Invoking(sut => sut.ParsePages(jsonObj))
                .Should()
                .Throw<ImportException>();
        }

        [Theory]
        [JsonPagesWithValidNotesAutoData]
        public void ParseNotes_ReturnsNotesFromJson_WhenPagesContainValidNotes(IEnumerable<PageJsonItem> pagesFromJson)
        {
            var expectedParsedNotes = pagesFromJson.SelectMany(p => p.Notes);

            var result = Sut.ParseNotes(pagesFromJson);

            result.Should().Contain(expectedParsedNotes);
        }

        [Theory]
        [JsonPagesWithDuplicateDisplayOrdersAutoData]
        [JsonPagesWithInvalidDisplayOrdersAutoData]
        [JsonPagesWithInvalidMealTypesAutoData]
        [JsonPagesWithInvalidProductQuantitiesAutoData]
        public void ParseNotes_ThrowsImportException_WhenPagesContainAtLeastOneInvalidNote(IEnumerable<PageJsonItem> pagesFromJson)
        {
            Sut.Invoking(sut => sut.ParseNotes(pagesFromJson))
                .Should()
                .Throw<ImportException>();
        }

        [Theory]
        [JsonNotesWithValidInfoAutoData]
        public void ParseProducts_ReturnsUniqueProductNames_WhenNotesInfoIsValid(IEnumerable<NoteJsonItem> notesFromJson)
        {
            var expectedProductNames = notesFromJson.Select(n => n.Product.Name)
                .Distinct();

            var result = Sut.ParseProducts(notesFromJson);

            result.Should().Contain(expectedProductNames);
        }

        [Theory]
        [JsonNotesWithInvalidProductAutoData]
        public void ParseProducts_ThrowsImportException_WhenNotesInfoIsInvalid(IEnumerable<NoteJsonItem> notesFromJson)
        {
            Sut.Invoking(sut => sut.ParseProducts(notesFromJson))
                .Should()
                .Throw<ImportException>();
        }

        [Theory]
        [JsonNotesWithValidInfoAutoData]
        public void ParseCategories_ReturnsUniqueCategoryNames_WhenNotesInfoIsValid(IEnumerable<NoteJsonItem> notesFromJson)
        {
            var expectedCategoryNames = notesFromJson.Select(n => n.Product.Category)
                .Distinct();

            var result = Sut.ParseCategories(notesFromJson);

            result.Should().Contain(expectedCategoryNames);
        }

        [Theory]
        [JsonNotesWithInvalidCategoryAutoData]
        public void ParseCategories_ThrowsImportException_WhenNotesInfoIsInvalid(IEnumerable<NoteJsonItem> notesFromJson)
        {
            Sut.Invoking(sut => sut.ParseCategories(notesFromJson))
                .Should()
                .Throw<ImportException>();
        }
    }
}
