using System.Collections.Generic;
using FluentAssertions;
using FoodDiary.API.Dtos;
using Xunit;

namespace FoodDiary.IntegrationTests
{
    public class GetDataScenarios : IntegrationTestsScenarioBase
    {
        public GetDataScenarios(CustomWebApplicationFactory<TestStartup> factory) : base(factory)
        {
        }

        #region Test data

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
                
                var searchResult = new PagesSearchResultDto()
                {
                    PageItems = expectedPages,
                    TotalPagesCount = 3
                };

                yield return new object[] { "2020-08-01", "2020-08-03", 1, 2, searchResult };
            }
        }

        public static IEnumerable<object[]> MemberData_GetCategories
        {
            get
            {
                var category1 = new CategoryItemDto()
                {
                    Id = 1,
                    Name = "First category",
                    CountProducts = 2
                };

                var category2 = new CategoryItemDto()
                {
                    Id = 2,
                    Name = "Second category",
                    CountProducts = 1
                };

                var expectedResult = new List<CategoryItemDto>() { category1, category2 };

                yield return new object[] { Endpoints.GetCategories, expectedResult };
            }
        }

        #endregion

        [Theory]
        [MemberData(nameof(MemberData_GetPages))]
        public async void GetPages_ReceivesPagesInCorrectFormat(
            string startDate,
            string endDate,
            int pageNumber,
            int pageSize,
            PagesSearchResultDto expectedPagesSearchResult)
        {
            // Arrange
            var requestUri = $"{Endpoints.GetPages}?startDate={startDate}&endDate={endDate}&pageNumber={pageNumber}&pageSize={pageSize}";

            // Act
            var pages = await _client.GetDataAsync<PagesSearchResultDto>(requestUri);

            // Assert
            pages.Should().BeEquivalentTo(expectedPagesSearchResult);
        }

        [Theory]
        [MemberData(nameof(MemberData_GetCategories))]
        public async void GetCategories_ReceivesCategoriesInCorrectFormat(string requestUri, IEnumerable<CategoryItemDto> expectedResult)
        {
            // Act
            var result = await _client.GetDataAsync<IEnumerable<CategoryItemDto>>(requestUri);

            // Assert
            result.Should().BeEquivalentTo(expectedResult);
        }

        [Fact]
        public async void GetDateForNewPage_ReceivesCorrectDate()
        {
            // Act
            var result = await _client.GetStringAsync(Endpoints.GetDateForNewPage);

            // Assert
            result.Should().Be("2020-08-07");
        }
    }
}
