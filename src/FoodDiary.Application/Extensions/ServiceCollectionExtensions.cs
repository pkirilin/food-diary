using System.Reflection;
using System.Runtime.CompilerServices;
using FoodDiary.Application.Features.Auth.SignInWithGoogle;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

[assembly:InternalsVisibleTo("FoodDiary.UnitTests")]

namespace FoodDiary.Application.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static void AddApplicationDependencies(this IServiceCollection services)
        {
            services.AddMediatR(Assembly.GetExecutingAssembly());

            services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
        }
    }
}
