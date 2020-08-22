using System.Reflection;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.Application.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static void AddApplicationDependencies(this IServiceCollection services)
        {
            services.AddMediatR(Assembly.GetExecutingAssembly());
        }
    }
}
