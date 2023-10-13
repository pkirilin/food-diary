using FoodDiary.IntegrationTests.Fakes;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.IntegrationTests
{
    // ReSharper disable once ClassNeverInstantiated.Global
    public class CustomWebApplicationFactory<TStartup> : WebApplicationFactory<TStartup> where TStartup : class
    {
        protected override IWebHostBuilder CreateWebHostBuilder()
        {
            var webHostBuilder = WebHost.CreateDefaultBuilder()
                .ConfigureAppConfiguration(builder =>
                {
                    builder.AddJsonFile("appsettings.json", false);
                    builder.AddJsonFile("appsettings.Test.json", true);
                    builder.AddEnvironmentVariables();
                })
                .UseStartup<TStartup>();

            return webHostBuilder;
        }

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseContentRoot(".");
            builder.UseEnvironment("Test");
            
            builder.ConfigureTestServices(services =>
            {
                services.AddSingleton<IAuthenticationSchemeProvider, FakeAuthenticationSchemeProvider>();
            });
            
            base.ConfigureWebHost(builder);
        }
    }
}
