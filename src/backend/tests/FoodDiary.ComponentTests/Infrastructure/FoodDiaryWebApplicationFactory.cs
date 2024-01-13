using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Containers;
using FoodDiary.API;
using FoodDiary.ComponentTests.Infrastructure.DateAndTime;
using FoodDiary.ComponentTests.Infrastructure.ExternalServices;
using FoodDiary.Infrastructure;
using JetBrains.Annotations;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Testcontainers.PostgreSql;

namespace FoodDiary.ComponentTests.Infrastructure;

[UsedImplicitly]
public class FoodDiaryWebApplicationFactory : WebApplicationFactory<Startup>, IAsyncLifetime
{
    private const string EnvironmentName = "ComponentTests";
    
    private readonly PostgreSqlContainer _dbContainer = new PostgreSqlBuilder()
        .WithImage("postgres:15.1-alpine")
        .WithUsername("postgres")
        .WithPassword("postgres")
        .WithDatabase("food-diary")
        .Build();
    
    private readonly IContainer _mountebankContainer = new ContainerBuilder()
        .WithImage("bbyars/mountebank:2.9.1")
        .WithPortBinding(2525, 2525)
        .WithPortBinding(GoogleIdentityProvider.Port, GoogleIdentityProvider.Port)
        .Build();
    
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
            var dbContextOptionsDescriptor = services
                .FirstOrDefault(d => d.ServiceType == typeof(DbContextOptions<FoodDiaryContext>));

            if (dbContextOptionsDescriptor is not null)
            {
                services.Remove(dbContextOptionsDescriptor);
                
                services.AddDbContext<FoodDiaryContext>(options =>
                {
                    options.UseNpgsql(_dbContainer.GetConnectionString());
                });
            }
            
            services.AddFakeDateAndTime();
            services.AddFakeExternalServices();

            services
                .AddDataProtection()
                .PersistKeysToFileSystem(new DirectoryInfo(Path.Combine("DataProtectionKeys")));
        });
    }

    public async Task InitializeAsync()
    {
        await _mountebankContainer.StartAsync();
        await _dbContainer.StartAsync();
        await using var scope = Services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<FoodDiaryContext>();
        await dbContext.Database.MigrateAsync();
    }

    public new async Task DisposeAsync()
    {
        await _dbContainer.StopAsync();
        await _mountebankContainer.StopAsync();
    }
}
