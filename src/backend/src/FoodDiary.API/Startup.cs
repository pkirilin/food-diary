using System.Reflection;
using System.Threading.Tasks;
using FoodDiary.API.Extensions;
using FoodDiary.API.Logging;
using FoodDiary.API.Middlewares;
using FoodDiary.API.Options;
using FoodDiary.Application.Extensions;
using FoodDiary.Configuration;
using FoodDiary.Configuration.Extensions;
using FoodDiary.Import.Extensions;
using FoodDiary.Infrastructure.Extensions;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Serilog;

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
                options.ExpireTimeSpan = Constants.AuthenticationParameters.CookieLifetime;
                options.ReturnUrlParameter = "returnUrl";
                options.Cookie.HttpOnly = true;
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                options.Cookie.SameSite = SameSiteMode.Lax;
                options.Cookie.MaxAge = Constants.AuthenticationParameters.CookieLifetime;

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
                options.TokenEndpoint = _googleAuthOptions.TokenEndpoint;
                options.UserInformationEndpoint = _googleAuthOptions.UserInformationEndpoint;
                options.SaveTokens = true;
                options.AccessType = "offline";
                options.ReturnUrlParameter = "returnUrl";
                options.Scope.Add(Constants.AuthenticationScopes.Openid);
                options.Scope.Add(Constants.AuthenticationScopes.Profile);
                options.Scope.Add(Constants.AuthenticationScopes.Email);
                options.Scope.Add(Constants.AuthenticationScopes.GoogleDocs);
                options.Scope.Add(Constants.AuthenticationScopes.GoogleDrive);
                
                options.Events.OnRedirectToAuthorizationEndpoint = context =>
                {
                    const string prompt = "select_account consent";
                    
                    var redirectUri = QueryHelpers.AddQueryString(
                        context.RedirectUri,
                        GoogleChallengeProperties.PromptParameterKey,
                        prompt);
                    
                    context.Properties.SetParameter(GoogleChallengeProperties.PromptParameterKey, prompt);
                    context.Response.Redirect(redirectUri);
                    return Task.CompletedTask;
                };
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

        services.AddHealthChecks()
            .AddCheck("liveness", () => HealthCheckResult.Healthy(), ["alive"])
            .AddCheck("readiness", () => HealthCheckResult.Healthy(), ["ready"]);
        
        services.AddSerilog((provider, logger) => logger.Configure(provider));

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
        var appOptions = app.ApplicationServices.GetRequiredService<IOptions<AppOptions>>().Value;
        
        if (appOptions.ForwardHttpsSchemeManuallyForAllRequests)
        {
            // Used to keep HTTPS scheme in OAuth redirects when load balancer does not set X-Forwarded-Proto
            // https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer?view=aspnetcore-8.0#when-it-isnt-possible-to-add-forwarded-headers-and-all-requests-are-secure
            app.Use((context, next) =>
            {
                context.Request.Scheme = "https";
                return next(context);
            });
        }
        
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
        app.UseSpaStaticFiles();
        app.UseSerilogRequestLogging();
        app.UseRouting();
        app.UseAuthentication();
        app.UseAuthorization();
        app.UseHttpsRedirection();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
            
            endpoints.MapHealthChecks("/healthz/live", new HealthCheckOptions
            {
                Predicate = healthCheck => healthCheck.Tags.Contains("alive")
            });
                
            endpoints.MapHealthChecks("/healthz/ready", new HealthCheckOptions
            {
                Predicate = healthCheck => healthCheck.Tags.Contains("ready")
            });
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