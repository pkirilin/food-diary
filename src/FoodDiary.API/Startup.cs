using System.Reflection;
using FoodDiary.API.Auth;
using FoodDiary.API.Extensions;
using FoodDiary.API.Middlewares;
using FoodDiary.API.Options;
using FoodDiary.Application.Extensions;
using FoodDiary.Configuration;
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
        private readonly AuthOptions _authOptions;
        private readonly GoogleAuthOptions _googleAuthOptions;
        
        public Startup(IConfiguration configuration, IHostEnvironment env)
        {
            Configuration = configuration;
            Env = env;
            _authOptions = Configuration.GetSection("Auth").Get<AuthOptions>();
            _googleAuthOptions = Configuration.GetSection("GoogleAuth").Get<GoogleAuthOptions>();
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
                    options.Authority = _googleAuthOptions.Authority;
                    options.Audience = _googleAuthOptions.ClientId;
                    options.RequireHttpsMetadata = Env.IsProduction();
                    options.TokenValidationParameters.AuthenticationType = Constants.Schemes.GoogleJwt;
                    options.TokenValidationParameters.ValidIssuers = new[]
                    {
                        _googleAuthOptions.Authority
                    };
                });

            services.AddAuthorization(options =>
            {
                options.AddPolicy(Constants.Policies.GoogleJwt, builder =>
                {
                    builder.AddAuthenticationSchemes(Constants.Schemes.GoogleJwt)
                        .RequireAuthenticatedUser()
                        .RequireClaim(Constants.ClaimNames.Email, _authOptions.AllowedEmails);
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
