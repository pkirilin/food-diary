using System.Reflection;
using FoodDiary.API.Auth;
using FoodDiary.API.Extensions;
using FoodDiary.API.Middlewares;
using FoodDiary.API.Options;
using FoodDiary.Application.Extensions;
using FoodDiary.Configuration.Extensions;
using FoodDiary.Import.Extensions;
using FoodDiary.Infrastructure.Extensions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace FoodDiary.API
{
    public class Startup
    {
        public Startup(IConfiguration configuration, IHostEnvironment env)
        {
            Configuration = configuration;
            Env = env;
        }

        private IConfiguration Configuration { get; }
        
        private IHostEnvironment Env { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();
            services.AddFoodDiarySwagger();
            
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "frontend/build";
            });

            services.AddCors(options => options.AddPolicy("Dev frontend", builder =>
                builder.WithOrigins("http://localhost:3000")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                )
            );

            services.AddAuthentication(Constants.Schemes.GoogleJwt)
                .AddJwtBearer(Constants.Schemes.GoogleJwt, options =>
                {
                    options.Authority = "https://accounts.google.com";
                    options.Audience = "772368064111-19hqh3c6ksu56ke45nm24etn7qoma88v.apps.googleusercontent.com";
                    options.RequireHttpsMetadata = Env.IsProduction();
                    options.TokenValidationParameters.AuthenticationType = Constants.Schemes.GoogleJwt;
                    options.TokenValidationParameters.ValidIssuers = new[]
                    {
                        "https://accounts.google.com"
                    };
                });

            services.AddAuthorization(options =>
            {
                options.AddPolicy(Constants.Policies.GoogleJwt, builder =>
                {
                    builder.AddAuthenticationSchemes(Constants.Schemes.GoogleJwt)
                        .RequireAuthenticatedUser();
                });
            });

            services.ConfigureCustomOptions(Configuration);
            services.Configure<ImportOptions>(Configuration.GetSection("Import"));

            services.AddInfrastructure(Env);

            services.AddRepositories();
            services.AddUtils();
            services.AddPagesJsonImportServices();
            services.AddApplicationDependencies();

            services.AddAutoMapper(Assembly.GetExecutingAssembly());
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "FoodDiary API v1");
                });

                app.UseCors("Dev frontend");
            }

            app.UseMiddleware<ExceptionHandlerMiddleware>();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();
            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();
            app.UseHttpsRedirection();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
            
            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "frontend";

                if (env.IsDevelopment())
                {
                    spa.UseProxyToSpaDevelopmentServer("http://localhost:3000");
                }
            });
        }
    }
}
