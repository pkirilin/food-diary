using AutoMapper;
using FoodDiary.API;
using FoodDiary.API.Controllers.v1;
using FoodDiary.API.Extensions;
using FoodDiary.API.Middlewares;
using FoodDiary.API.Options;
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

            // Injecting in-memory db context as a singleton to share stored data across multiple requests
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

            services.AddControllers()
                .AddApplicationPart(typeof(CategoriesController).Assembly);
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
        }
    }
}
