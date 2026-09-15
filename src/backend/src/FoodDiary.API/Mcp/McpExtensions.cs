using FoodDiary.API.Mcp.Authorization;
using FoodDiary.API.Mcp.Prompts;
using FoodDiary.API.Mcp.Tools;
using FoodDiary.Configuration;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using ModelContextProtocol.AspNetCore;
using ModelContextProtocol.AspNetCore.Authentication;
using ModelContextProtocol.Authentication;

namespace FoodDiary.API.Mcp;

public static class McpExtensions
{
    private const string McpAuthorizationPolicy = "Mcp";

    private static readonly PathString[] McpAndOAuthPaths = ["/mcp", "/authorize", "/token", "/.well-known"];

    public static void AddFoodDiaryMcp(this IServiceCollection services, IConfiguration configuration)
    {
        var mcpSection = configuration.GetSection(McpOptions.SectionName);

        services.AddOptions<McpOptions>()
            .Bind(mcpSection)
            .ValidateOnStart();

        services.AddSingleton<IValidateOptions<McpOptions>, McpOptionsValidator>();

        services.AddMemoryCache();
        services.AddSingleton<AuthorizeRequestValidator>();
        services.AddSingleton<McpTokenService>();
        services.AddScoped<AuthorizeRequestHandler>();
        services.AddScoped<TokenRequestHandler>();

        if (mcpSection.Get<McpOptions>() is { Enabled: true })
        {
            services.AddMcpResourceServer();
        }
    }

    public static void MapMcpResourceServer(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapMcp("/mcp").RequireAuthorization(McpAuthorizationPolicy);
    }

    public static void UseNotFoundForMcpAndOAuthPaths(this IApplicationBuilder app)
    {
        app.MapWhen(
            context => McpAndOAuthPaths.Any(path => context.Request.Path.StartsWithSegments(path)),
            branch => branch.Run(context =>
            {
                context.Response.StatusCode = StatusCodes.Status404NotFound;
                return Task.CompletedTask;
            }));
    }

    private static void AddMcpResourceServer(this IServiceCollection services)
    {
        services.AddMcpServer()
            .WithHttpTransport(options => options.SessionMode = HttpServerSessionMode.Stateless)
            .AddAuthorizationFilters()
            .WithToolsFromAssembly()
            .WithPromptsFromAssembly();

        services.AddAuthentication()
            .AddScheme<AuthenticationSchemeOptions, McpAccessTokenHandler>(McpAccessTokenHandler.SchemeName, configureOptions: null)
            .AddMcp();

        services.AddOptions<McpAuthenticationOptions>(McpAuthenticationDefaults.AuthenticationScheme)
            .Configure<IOptions<McpOptions>>((options, mcpOptions) =>
            {
                options.ForwardAuthenticate = McpAccessTokenHandler.SchemeName;
                options.ForwardChallenge = McpAccessTokenHandler.SchemeName;
                options.ResourceMetadataUri = new Uri(mcpOptions.Value.ResourceMetadataUrl);
                options.ResourceMetadata = new ProtectedResourceMetadata
                {
                    Resource = mcpOptions.Value.McpResource,
                    AuthorizationServers = [mcpOptions.Value.BaseUrl!],
                    ScopesSupported = [McpScopes.FoodRead]
                };
            });

        services.AddOptions<AuthorizationOptions>()
            .Configure<IOptions<AuthOptions>>((options, authOptions) => options
                .AddPolicy(McpAuthorizationPolicy, policy => policy
                    .AddAuthenticationSchemes(McpAuthenticationDefaults.AuthenticationScheme)
                    .RequireAuthenticatedUser()
                    .RequireClaim(Constants.ClaimTypes.Email, authOptions.Value.AllowedEmails)));
    }
}
