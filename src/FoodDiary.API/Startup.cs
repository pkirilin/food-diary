using System;
using System.Reflection;
using System.Threading.Tasks;
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
using Microsoft.AspNetCore.Http;
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

            services.AddAuthentication(Constants.AuthenticationSchemes.OAuthGoogle)
                .AddCookie(Constants.AuthenticationSchemes.Cookie, options =>
                {
                    options.SlidingExpiration = true;
                    options.ExpireTimeSpan = TimeSpan.FromHours(1);
                    options.ReturnUrlParameter = "returnUrl";
                    options.Cookie.HttpOnly = true;
                    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                    options.Cookie.SameSite = SameSiteMode.Lax;
                    options.Cookie.MaxAge = TimeSpan.FromHours(1);

                    options.Events.OnSigningOut = context =>
                    {
                        context.Response.Redirect("/post-logout");
                        return Task.CompletedTask;
                    };
                })
                .AddGoogle(Constants.AuthenticationSchemes.OAuthGoogle, options =>
                {
                    options.SignInScheme = Constants.AuthenticationSchemes.Cookie;
                    options.ClientId = _googleAuthOptions.ClientId;
                    options.ClientSecret = _googleAuthOptions.ClientSecret;
                    options.SaveTokens = true;
                    options.Scope.Add("openid");
                    options.Scope.Add("profile");
                    options.Scope.Add("email");
                    options.ReturnUrlParameter = "returnUrl";
                });

            services.AddAuthorization(options =>
            {
                options.AddPolicy(Constants.AuthorizationPolicies.GoogleAllowedEmails, builder =>
                {
                    builder.AddAuthenticationSchemes(Constants.AuthenticationSchemes.OAuthGoogle)
                        .RequireAuthenticatedUser()
                        .RequireClaim(Constants.ClaimTypes.Email, _authOptions.AllowedEmails);
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
