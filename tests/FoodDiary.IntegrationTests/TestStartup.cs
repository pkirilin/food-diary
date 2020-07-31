using System;
using AutoMapper;
using FoodDiary.API;
using FoodDiary.API.Controllers.v1;
using FoodDiary.API.Extensions;
using FoodDiary.API.Middlewares;
using FoodDiary.API.Options;
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
            services.AddAppServices();
            services.AddUtils();
            services.AddPagesPdfGenerator();
            services.AddPagesJsonImportServices();

            services.AddAutoMapper(typeof(AutoMapperProfile).Assembly);

            // Application parts are also added for integration tests web host to identify controllers
            services.AddControllers()
                .AddApplicationPart(typeof(PagesController).Assembly)
                .AddApplicationPart(typeof(NotesController).Assembly);
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

            var category1 = new Category()
            {
                Id = 100,
                Name = "First category"
            };
            var category2 = new Category()
            {
                Id = 101,
                Name = "Second category"
            };

            var product1 = new Product()
            {
                Id = 100,
                Name = "First product",
                CaloriesCost = 120,
                Category = category1
            };
            var product2 = new Product()
            {
                Id = 101,
                Name = "Second product",
                CaloriesCost = 150,
                Category = category2
            };

            var page1 = new Page()
            {
                Id = 100,
                Date = DateTime.Parse("2020-08-01")
            };

            var page2 = new Page()
            {
                Id = 101,
                Date = DateTime.Parse("2020-08-02")
            };

            var page3 = new Page()
            {
                Id = 102,
                Date = DateTime.Parse("2020-08-03")
            };

            context.Pages.Add(page1);

            context.Notes.Add(new Note()
            {
                Id = 100,
                MealType = MealType.Breakfast,
                ProductQuantity = 170,
                DisplayOrder = 0,
                Product = product1,
                Page = page1,
            });

            context.Notes.Add(new Note()
            {
                Id = 101,
                MealType = MealType.Dinner,
                ProductQuantity = 50,
                DisplayOrder = 0,
                Product = product2,
                Page = page1,
            });

            context.Notes.Add(new Note()
            {
                Id = 102,
                MealType = MealType.Breakfast,
                ProductQuantity = 200,
                DisplayOrder = 0,
                Product = product1,
                Page = page2,
            });

            context.Notes.Add(new Note()
            {
                Id = 103,
                MealType = MealType.Breakfast,
                ProductQuantity = 300,
                DisplayOrder = 1,
                Product = product2,
                Page = page2,
            });

            context.Notes.Add(new Note()
            {
                Id = 104,
                MealType = MealType.Lunch,
                ProductQuantity = 250,
                DisplayOrder = 0,
                Product = product2,
                Page = page2,
            });

            context.Notes.Add(new Note()
            {
                Id = 105,
                MealType = MealType.Dinner,
                ProductQuantity = 150,
                DisplayOrder = 0,
                Product = product1,
                Page = page3,
            });

            context.SaveChanges();
        }
    }
}
