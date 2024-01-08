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

namespace FoodDiary.API;

public class Startup
{
    private readonly AuthOptions _authOptions;
    private readonly GoogleAuthOptions _googleAuthOptions;
    private readonly IConfiguration _configuration;
        
    public Startup(IConfiguration configuration)
    {
        _configuration = configuration;
        _authOptions = _configuration.GetSection("Auth").Get<AuthOptions>()!;
        _googleAuthOptions = _configuration.GetSection("GoogleAuth").Get<GoogleAuthOptions>()!;
    }

    public void ConfigureServices(IServiceCollection services)
    {
        services.AddControllers();
        services.AddFoodDiarySwagger();
        services.AddHttpContextAccessor();
            
        services.AddSpaStaticFiles(configuration =>
        {
            configuration.RootPath = "frontend/dist";
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
                options.Scope.Add("https://www.googleapis.com/auth/documents");
                options.Scope.Add("https://www.googleapis.com/auth/drive");
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

        services.ConfigureCustomOptions(_configuration);
        services.Configure<ImportOptions>(_configuration.GetSection("Import"));

        services.AddInfrastructure();

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
                spa.UseProxyToSpaDevelopmentServer("http://localhost:5173");
            }
        });
    }
}