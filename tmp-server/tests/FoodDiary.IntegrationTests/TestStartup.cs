using System;
using System.Collections.Generic;
using AutoMapper;
using FoodDiary.API;
using FoodDiary.API.Controllers.v1;
using FoodDiary.API.Extensions;
using FoodDiary.API.Middlewares;
using FoodDiary.API.Options;
using FoodDiary.Application.Extensions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;
using FoodDiary.Import.Extensions;
using FoodDiary.Infrastructure;
using FoodDiary.PdfGenerator.Extensions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace FoodDiary.IntegrationTests
{
    public class TestStartup
    {
        public TestStartup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<ImportOptions>(Configuration.GetSection("Import"));

            // Injecting in-memory db context as a singleton to share stored data across multiple requests in single scenario
            services.AddDbContext<FoodDiaryContext>(options =>
            {
                var sp = new ServiceCollection()
                    .AddEntityFrameworkInMemoryDatabase()
                    .BuildServiceProvider();

                options.UseInMemoryDatabase("InMemoryAppDb");
                options.UseInternalServiceProvider(sp);
            }, ServiceLifetime.Singleton);

            services.AddRepositories();
            services.AddUtils();
            services.AddPagesPdfGenerator();
            services.AddPagesJsonImportServices();

            services.AddAutoMapper(typeof(AutoMapperProfile).Assembly);
            services.AddApplicationDependencies();

            // Application parts are also added for integration tests web host to identify controllers
            services.AddControllers()
                .AddApplicationPart(typeof(PagesController).Assembly)
                .AddApplicationPart(typeof(NotesController).Assembly)
                .AddApplicationPart(typeof(ProductsController).Assembly)
                .AddApplicationPart(typeof(CategoriesController).Assembly)
                .AddApplicationPart(typeof(ExportsController).Assembly)
                .AddApplicationPart(typeof(ImportsController).Assembly);
            services.AddFoodDiarySwagger();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            SeedDatabaseForIntegrationTests(app);

            app.UseRouting();
            app.UseMiddleware<ExceptionHandlerMiddleware>();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }

        private void SeedDatabaseForIntegrationTests(IApplicationBuilder app)
        {
            var context = app.ApplicationServices.GetService<FoodDiaryContext>();
            context.Database.EnsureCreated();

            context.Categories.AddRange(GetTestCategories());
            context.Products.AddRange(GetTestProducts());
            context.Pages.AddRange(GetTestPages());
            context.Notes.AddRange(GetTestNotes());
            
            context.SaveChanges();
        }

        private IEnumerable<Category> GetTestCategories()
        {
            yield return new Category()
            {
                Id = 1,
                Name = "First category"
            };

            yield return new Category()
            {
                Id = 2,
                Name = "Second category"
            };
        }

        private IEnumerable<Product> GetTestProducts()
        {
            yield return new Product()
            {
                Id = 1,
                Name = "First product",
                CaloriesCost = 120,
                CategoryId = 1
            };

            yield return new Product()
            {
                Id = 2,
                Name = "Second product",
                CaloriesCost = 150,
                CategoryId = 2
            };

            yield return new Product()
            {
                Id = 3,
                Name = "Third product",
                CaloriesCost = 100,
                CategoryId = 1
            };
        }

        private IEnumerable<Page> GetTestPages()
        {
            yield return new Page()
            {
                Id = 1,
                Date = DateTime.Parse("2020-08-01")
            };

            yield return new Page()
            {
                Id = 2,
                Date = DateTime.Parse("2020-08-02")
            };

            yield return new Page()
            {
                Id = 3,
                Date = DateTime.Parse("2020-08-03")
            };

            yield return new Page()
            {
                Id = 4,
                Date = DateTime.Parse("2020-08-04")
            };

            yield return new Page()
            {
                Id = 5,
                Date = DateTime.Parse("2020-08-05")
            };

            yield return new Page()
            {
                Id = 6,
                Date = DateTime.Parse("2020-08-06")
            };
        }

        private IEnumerable<Note> GetTestNotes()
        {
            yield return new Note()
            {
                Id = 1,
                MealType = MealType.Breakfast,
                ProductQuantity = 170,
                DisplayOrder = 0,
                ProductId = 1,
                PageId = 1,
            };

            yield return new Note()
            {
                Id = 2,
                MealType = MealType.Dinner,
                ProductQuantity = 50,
                DisplayOrder = 0,
                ProductId = 2,
                PageId = 1,
            };

            yield return new Note()
            {
                Id = 3,
                MealType = MealType.Breakfast,
                ProductQuantity = 200,
                DisplayOrder = 0,
                ProductId = 1,
                PageId = 2,
            };

            yield return new Note()
            {
                Id = 4,
                MealType = MealType.Breakfast,
                ProductQuantity = 300,
                DisplayOrder = 1,
                ProductId = 2,
                PageId = 2,
            };

            yield return new Note()
            {
                Id = 5,
                MealType = MealType.Lunch,
                ProductQuantity = 250,
                DisplayOrder = 0,
                ProductId = 2,
                PageId = 2,
            };

            yield return new Note()
            {
                Id = 6,
                MealType = MealType.Dinner,
                ProductQuantity = 150,
                DisplayOrder = 0,
                ProductId = 1,
                PageId = 3,
            };
        }
    }
}
