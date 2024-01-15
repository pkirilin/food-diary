using FoodDiary.API;
using FoodDiary.ComponentTests.Infrastructure.DateAndTime;
using FoodDiary.ComponentTests.Infrastructure.ExternalServices;
using FoodDiary.Export.GoogleDocs;
using JetBrains.Annotations;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.ComponentTests.Infrastructure;

[UsedImplicitly]
public class FoodDiaryWebApplicationFactory : WebApplicationFactory<Startup>
{
    private const string EnvironmentName = "ComponentTests";
    
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment(EnvironmentName);
        
        builder.ConfigureAppConfiguration(configurationBuilder =>
        {
            configurationBuilder
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", true, true)
                .AddJsonFile($"appsettings.{EnvironmentName}.json", false, false);
        });
        
        builder.ConfigureTestServices(services =>
        {
            services.AddFakeDateAndTime();
            services.AddSingleton<IGoogleDriveClient, FakeGoogleDriveClient>();
            services.AddSingleton<IGoogleDocsClient, FakeGoogleDocsClient>();

            services
                .AddDataProtection()
                .PersistKeysToFileSystem(new DirectoryInfo(Path.Combine("DataProtectionKeys")));
        });
    }
}
