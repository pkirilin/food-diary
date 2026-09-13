using Microsoft.Extensions.Options;

namespace FoodDiary.API.Mcp;

public static class McpExtensions
{
    private static readonly PathString[] McpAndOAuthPaths = ["/mcp", "/authorize", "/token", "/.well-known"];

    public static void AddFoodDiaryMcp(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<McpOptions>()
            .Bind(configuration.GetSection(McpOptions.SectionName))
            .ValidateOnStart();

        services.AddSingleton<IValidateOptions<McpOptions>, McpOptionsValidator>();
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
}
