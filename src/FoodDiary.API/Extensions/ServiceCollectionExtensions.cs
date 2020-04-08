using System;
using System.IO;
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
                var xmlCommentsFilePath = Path.Combine(System.AppContext.BaseDirectory, "FoodDiary.API.xml");

                if (File.Exists(xmlCommentsFilePath))
                {
                    c.IncludeXmlComments(xmlCommentsFilePath);
                }

                var commonApiInfo = new OpenApiInfo
                {
                    Title = "FoodDiary API",
                    Description = "This document describes API for FoodDiary server-side application",
                    Contact = new OpenApiContact()
                    {
                        Name = "Pavel Kirilin",
                        Email = "kirilin.pav@gmail.com",
                        Url = new Uri("https://github.com/pkirilin/food-diary-server")
                    }
                };

                commonApiInfo.Version = "v1";
                c.SwaggerDoc("v1", commonApiInfo);
            });
        }
    }
}
