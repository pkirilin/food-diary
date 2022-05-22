using System;
using System.Collections.Generic;
using FluentAssertions;
using FoodDiary.Contracts.Export.Json;
using Newtonsoft.Json;
using Xunit;

namespace FoodDiary.IntegrationTests
{
    public class ExportScenarios : IntegrationTestsScenarioBase
    {
        public ExportScenarios(CustomWebApplicationFactory<TestStartup> factory) : base(factory)
        {
        }

        public static IEnumerable<object[]> MemberData_ExportPagesJson
        {
            get
            {
                var requestUri = $"{Endpoints.ExportPagesJson}?startDate=2020-08-01&endDate=2020-08-02";

                var product1 = new JsonExportProductDto()
                {
                    Name = "First product",
                    CaloriesCost = 120,
                    Category = "First category"
                };

                var product2 = new JsonExportProductDto()
                {
                    Name = "Second product",
                    CaloriesCost = 150,
                    Category = "Second category"
                };

                var note1 = new JsonExportNoteDto()
                {
                    MealType = 1,
                    ProductQuantity = 170,
                    DisplayOrder = 0,
                    Product = product1
                };

                var note2 = new JsonExportNoteDto()
                {
                    MealType = 5,
                    ProductQuantity = 50,
                    DisplayOrder = 0,
                    Product = product2
                };

                var note3 = new JsonExportNoteDto()
                {
                    MealType = 1,
                    ProductQuantity = 200,
                    DisplayOrder = 0,
                    Product = product1
                };

                var note4 = new JsonExportNoteDto()
                {
                    MealType = 1,
                    ProductQuantity = 300,
                    DisplayOrder = 1,
                    Product = product2
                };

                var note5 = new JsonExportNoteDto()
                {
                    MealType = 3,
                    ProductQuantity = 250,
                    DisplayOrder = 0,
                    Product = product2
                };

                var expectedJsonObj = new JsonExportFileDto()
                {
                    Pages = new List<JsonExportPageDto>()
                    {
                        new JsonExportPageDto()
                        {
                            Date = DateTime.Parse("2020-08-01"),
                            Notes = new List<JsonExportNoteDto>() { note1, note2 }
                        },
                        new JsonExportPageDto()
                        {
                            Date = DateTime.Parse("2020-08-02"),
                            Notes = new List<JsonExportNoteDto>() { note3, note4, note5 }
                        },
                    }
                };

                yield return new object[] { requestUri, expectedJsonObj };
            }
        }

        [Fact]
        public async void ExportPagesPdf_DownloadsExistingPages()
        {
            // Arrange
            var requestUri = $"{Endpoints.ExportPagesPdf}?startDate=2020-08-01&endDate=2020-08-06";

            // Act
            var response = await _client.GetAsync(requestUri);

            // Assert
            response.EnsureSuccessStatusCode();
        }

        [Theory]
        [MemberData(nameof(MemberData_ExportPagesJson))]
        public async void ExportPagesJson_DownloadsExistingPages(string requestUri, JsonExportFileDto expectedJsonObj)
        {
            // Act
            var jsonString = await _client.GetStringAsync(requestUri);
            var jsonObj = JsonConvert.DeserializeObject<JsonExportFileDto>(jsonString);

            // Assert
            jsonObj.Should().BeEquivalentTo(expectedJsonObj);
        }
    }
}
