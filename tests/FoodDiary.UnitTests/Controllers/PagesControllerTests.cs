using FoodDiary.Domain.Dtos;
using Xunit;
using AutoFixture.Xunit2;
using FoodDiary.Domain.Enums;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using FoodDiary.API.Controllers.v1;
using AutoMapper;
using FoodDiary.API;
using System.Reflection;
using FoodDiary.Domain.Services;
using Moq;
using AutoFixture;
using FoodDiary.Domain.Entities;
using System.Linq;
using FoodDiary.UnitTests.Customizations;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;

namespace FoodDiary.UnitTests.Controllers
{
    public class PagesControllerTests
    {
        private readonly ILoggerFactory _loggerFactory;

        private readonly IMapper _mapper;

        private readonly Mock<IPageService> _pageServiceMock;

        public PagesControllerTests()
        {
            var serviceProvider = new ServiceCollection()
                .AddLogging()
                .AddAutoMapper(Assembly.GetAssembly(typeof(AutoMapperProfile)))
                .BuildServiceProvider();

            _loggerFactory = serviceProvider.GetService<ILoggerFactory>();
            _mapper = serviceProvider.GetService<IMapper>();
            _pageServiceMock = new Mock<IPageService>();
        }

        public PagesController PagesController => new PagesController(_loggerFactory, _mapper, _pageServiceMock.Object);

        [Theory]
        [InlineAutoData]
        [InlineAutoData(SortOrder.Descending, null)]
        public async void GetPagesList_ReturnsFilteredPages_WhenModelStateIsValid(SortOrder sortOrder, int? showCount)
        {
            var pageFilter = new PageFilterDto()
            {
                SortOrder = sortOrder,
                ShowCount = showCount
            };
            var fixture = new Fixture().Customize(new FixtureWithCircularReferencesCustomization());
            var mockPages = fixture.CreateMany<Page>(pageFilter.ShowCount.GetValueOrDefault()).ToList();

            _pageServiceMock.Setup(s => s.SearchPagesAsync(pageFilter, default))
                .ReturnsAsync(mockPages);

            var controller = PagesController;

            var result = await controller.GetPagesList(pageFilter);

            _pageServiceMock.Verify(s => s.SearchPagesAsync(pageFilter, default), Times.Once);

            result.Should().BeOfType<OkObjectResult>();
        }
    }
}
