using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using FluentAssertions;
using FoodDiary.API.Dtos;
using FoodDiary.API.Requests;
using FoodDiary.Domain.Enums;
using Xunit;

namespace FoodDiary.IntegrationTests
{
    public class MainScenarios : IClassFixture<CustomWebApplicationFactory<TestStartup>>
    {
        private readonly HttpClient _client;

        public MainScenarios(CustomWebApplicationFactory<TestStartup> factory)
        {
            _client = factory.CreateClient();
        }

        public static IEnumerable<object[]> MemberData_GetPages
        {
            get
            {
                var expectedPages = new List<PageItemDto>()
                {
                    new PageItemDto()
                    {
                        Id = 102,
                        Date = "2020-08-03",
                        CountNotes = 1,
                        CountCalories = 180,
                    },
                    new PageItemDto()
                    {
                        Id = 101,
                        Date = "2020-08-02",
                        CountNotes = 3,
                        CountCalories = 1065,
                    },
                };

                yield return new object[] { "2020-08-02", "2020-08-03", expectedPages };
            }
        }

        public static IEnumerable<object[]> MemberData_GetNotes
        {
            get
            {
                var expectedNotes = new List<NoteItemDto>()
                {
                    new NoteItemDto()
                    {
                        Id = 102,
                        MealType = MealType.Breakfast,
                        ProductQuantity = 200,
                        DisplayOrder = 0,
                        ProductId = 100,
                        ProductName = "First product",
                        PageId = 101,
                        Calories = 240,
                    },
                    new NoteItemDto()
                    {
                        Id = 103,
                        MealType = MealType.Breakfast,
                        ProductQuantity = 300,
                        DisplayOrder = 1,
                        ProductId = 101,
                        ProductName = "Second product",
                        PageId = 101,
                        Calories = 450,
                    },
                };

                yield return new object[] { 101, MealType.Breakfast, expectedNotes };
            }
        }

        [Theory]
        [MemberData(nameof(MemberData_GetPages))]
        public async void GetPages_ReceivesPagesInCorrectFormat(string startDate, string endDate, IEnumerable<PageItemDto> expectedPages)
        {
            // Arrange
            var queryString = $"{Endpoints.GetPages}?startDate={startDate}&endDate={endDate}";

            // Act
            var pages = await _client.GetDataAsync<IEnumerable<PageItemDto>>(queryString);

            // Assert
            pages.Should().BeEquivalentTo(expectedPages);
        }

        [Theory]
        [MemberData(nameof(MemberData_GetNotes))]
        public async void GetNotes_ReceivesNotesInCorrectFormat(int pageId, MealType mealType, IEnumerable<NoteItemDto> expectedNotes)
        {
            // Arrange
            var queryString = $"{Endpoints.GetNotes}?pageId={pageId}&mealType={mealType}";

            // Act
            var notes = await _client.GetDataAsync<IEnumerable<NoteItemDto>>(queryString);

            // Assert
            notes.Should().BeEquivalentTo(expectedNotes);
        }

        [Theory]
        [InlineData("2020-07-30")]
        public async void PostValidPage_CreatesNewDiaryPage(string newPageDate)
        {
            // Arrange
            var newPageRequest = new PageCreateEditRequest()
            {
                Date = DateTime.Parse(newPageDate)
            };
            var pagesSearchQuery = $"{Endpoints.GetPages}?startDate=2020-07-30&endDate=2020-07-30";

            // Act
            var response = await _client.PostDataAsync(Endpoints.CreatePage, newPageRequest);
            var pages = await _client.GetDataAsync<IEnumerable<PageItemDto>>(pagesSearchQuery);

            // Assert
            pages.Should().Contain(p => p.Date == newPageDate);
        }

        [Theory]
        [InlineData(MealType.Lunch, 250, 0, 100, 100)]
        public async void PostValidNote_CreatesNewDiaryNote(MealType mealType, int productQuantity, int displayOrder, int productId, int pageId)
        {
            // Arrange
            var newNoteRequest = new NoteCreateEditRequest()
            {
                MealType = mealType,
                ProductQuantity = productQuantity,
                DisplayOrder = displayOrder,
                ProductId = productId,
                PageId = pageId,
            };
            var notesSearchQuery = $"{Endpoints.GetNotes}?pageId={pageId}";

            // Act
            var response = await _client.PostDataAsync(Endpoints.CreateNote, newNoteRequest);
            var notes = await _client.GetDataAsync<IEnumerable<NoteItemDto>>(notesSearchQuery);

            // Assert
            notes.Should().Contain(n =>
                n.MealType == mealType
                && n.ProductQuantity == productQuantity
                && n.DisplayOrder == displayOrder
                && n.ProductId == productId
                && n.PageId == pageId
            );
        }

        [Fact]
        public async void PostInvalidNote_ReturnsBadRequest()
        {
            // Arrange
            var request = new NoteCreateEditRequest();

            // Act
            var response = await _client.PostDataAsync(Endpoints.CreateNote, request, false);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Theory]
        [InlineData(101, 100)]
        public async void DeleteExistingNote_RemovesNoteFromDiaryPage(int noteId, int pageId)
        {
            // Arrange
            var notesSearchQuery = $"{Endpoints.GetNotes}?pageId={pageId}";

            // Act
            var deleteNoteResponse = await _client.DeleteAsync($"{Endpoints.DeleteNote}/{noteId}");
            deleteNoteResponse.EnsureSuccessStatusCode();
            var notes = await _client.GetDataAsync<IEnumerable<NoteItemDto>>(notesSearchQuery);

            // Assert
            notes.Should().NotContain(n => n.Id == noteId);
        }
    }
}
