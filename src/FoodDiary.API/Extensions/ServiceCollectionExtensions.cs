using FoodDiary.Domain.Repositories;
using FoodDiary.Domain.Services;
using FoodDiary.Infrastructure.Repositories;
using FoodDiary.Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;

namespace FoodDiary.API.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static void AddRepositories(this IServiceCollection services)
        {
            services.AddTransient<IPageRepository, PageRepository>();
            services.AddTransient<INoteRepository, NoteRepository>();
            services.AddTransient<ICategoryRepository, CategoryRepository>();
            services.AddTransient<IProductRepository, ProductRepository>();
        }

        public static void AddDomainServices(this IServiceCollection services)
        {
            services.AddTransient<IPageService, PageService>();
            services.AddTransient<INoteService, NoteService>();
            services.AddTransient<INotesOrderService, NotesOrderService>();
            services.AddTransient<ICategoryService, CategoryService>();
            services.AddTransient<IProductService, ProductService>();
            services.AddTransient<ICaloriesService, CaloriesService>();
        }

        public static void AddFoodDiarySwagger(this IServiceCollection services)
        {
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "FoodDiary API", Version = "v1" });
            });
        }
    }
}
