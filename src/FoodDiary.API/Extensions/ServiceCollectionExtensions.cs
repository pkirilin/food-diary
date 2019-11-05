using FoodDiary.Domain.Repositories;
using FoodDiary.Infrastructure.Repositories;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.API.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static void AddRepositories(this IServiceCollection services)
        {
            services.AddTransient<IPageRepository, PageRepository>();
        }
    }
}
