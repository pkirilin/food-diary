using FoodDiary.Domain.Repositories;
using FoodDiary.Domain.Services;
using FoodDiary.Infrastructure.Repositories;
using FoodDiary.Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.API.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static void AddRepositories(this IServiceCollection services)
        {
            services.AddTransient<IPageRepository, PageRepository>();
        }

        public static void AddDomainServices(this IServiceCollection services)
        {
            services.AddTransient<IPageService, PageService>();
        }
    }
}
