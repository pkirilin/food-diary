using System.Collections.Generic;
using FluentAssertions;
using FoodDiary.API.Dtos;
using FoodDiary.Domain.Enums;
using Xunit;

namespace FoodDiary.IntegrationTests
{
    public class GetDataScenarios : IntegrationTestsScenarioBase
    {
        public GetDataScenarios(CustomWebApplicationFactory<TestStartup> factory) : base(factory)
        {
        }

        public static IEnumerable<object[]> MemberData_GetPages
        {
            get
            {
                var expectedPages = new List<PageItemDto>()
                {
                    new PageItemDto()
                    {
                        Id = 3,
                        Date = "2020-08-03",
                        CountNotes = 1,
                        CountCalories = 180,
                    },
                    new PageItemDto()
                    {
                        Id = 2,
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
                        Id = 3,
                        MealType = MealType.Breakfast,
                        ProductQuantity = 200,
                        DisplayOrder = 0,
                        ProductId = 1,
                        ProductName = "First product",
                        PageId = 2,
                        Calories = 240,
                    },
                    new NoteItemDto()
                    {
                        Id = 4,
                        MealType = MealType.Breakfast,
                        ProductQuantity = 300,
                        DisplayOrder = 1,
                        ProductId = 2,
                        ProductName = "Second product",
                        PageId = 2,
                        Calories = 450,
                    },
                };

                yield return new object[] { 2, MealType.Breakfast, expectedNotes };
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
    }
}
