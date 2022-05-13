using System.Reflection;
using System.Runtime.CompilerServices;
using FoodDiary.Application.Features.Auth.SignInWithGoogle;
using FoodDiary.Application.Services.Auth;
using FoodDiary.Application.Services.Categories;
using FoodDiary.Application.Services.Export;
using FoodDiary.Application.Services.Export.DataLoader;
using FoodDiary.Application.Services.Products;
using FoodDiary.Export.GoogleDocs.Extensions;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

[assembly:InternalsVisibleTo("FoodDiary.UnitTests")]

namespace FoodDiary.Application.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static void AddApplicationDependencies(this IServiceCollection services)
        {
            services.AddMediatR(Assembly.GetExecutingAssembly());
            services.AddApplicationServices();
        }

        private static void AddApplicationServices(this IServiceCollection services)
        {
            services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
            services.AddSingleton<IAuthService, AuthService>();
            
            services.AddScoped<IProductsService, ProductsService>();
            services.AddScoped<ICategoriesService, CategoriesService>();

            services.AddScoped<IExportService, ExportService>();
            services.AddScoped<IExportDataLoader, ExportDataLoader>();
            services.AddGoogleDocsExportService();
        }
    }
}
