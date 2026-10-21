namespace FoodDiary.API.Extensions;

public static class ApplicationBuilderExtensions
{
    public static void UseContentSecurityPolicy(this IApplicationBuilder app)
    {
        app.Use((context, next) =>
        {
            context.Response.OnStarting(() =>
            {
                context.Response.Headers.ContentSecurityPolicy = "frame-ancestors 'none'";
                return Task.CompletedTask;
            });

            return next(context);
        });
    }
}
