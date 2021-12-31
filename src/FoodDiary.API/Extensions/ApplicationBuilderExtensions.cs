using System;
using FoodDiary.Infrastructure;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.API.Extensions
{
    public static class ApplicationBuilderExtensions
    {
#pragma warning disable IDE0063
        public static void MigrateDatabase(this IApplicationBuilder app)
        {
            using (var serviceScope = app.ApplicationServices
                .GetRequiredService<IServiceScopeFactory>()
                .CreateScope())
            {
                using (var context = serviceScope.ServiceProvider.GetService<FoodDiaryContext>())
                {
                    context.Database.Migrate();
                }
            }
        }
#pragma warning restore IDE0063

        public static void UseFoodDiarySwagger(this IApplicationBuilder app)
        {
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "FoodDiary API v1");
            });
        }
    }
}
