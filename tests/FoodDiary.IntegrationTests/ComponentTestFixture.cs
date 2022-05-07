using System;
using FoodDiary.API.Extensions;
using FoodDiary.Application.Extensions;
using FoodDiary.Application.Services.Export;
using FoodDiary.Infrastructure;
using FoodDiary.Infrastructure.Extensions;
using FoodDiary.IntegrationTests.Database;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting.Internal;

namespace FoodDiary.IntegrationTests;

// ReSharper disable once ClassNeverInstantiated.Global
public class ComponentTestFixture : IDisposable
{
    private readonly IServiceProvider _serviceProvider;
    
    private IServiceScope _scope;
    private SqliteConnection? _connection;
    
    public ComponentTestFixture()
    {
        _serviceProvider = ConfigureServices().BuildServiceProvider();
        _scope = _serviceProvider.CreateScope();
    }

    public IExportDataLoader CreateExportDataLoader()
    {
        return CreateComponent<IExportDataLoader>();
    }
    
    public void Dispose()
    {
        _scope.Dispose();
        _connection?.Close();
    }

    private T CreateComponent<T>() where T : notnull
    {
        var context = _scope.ServiceProvider.GetRequiredService<FoodDiaryContext>();
        TestDatabaseUtils.Clear(context, _connection);
        TestDatabaseUtils.Initialize(context);

        _scope.Dispose();
        _scope = _serviceProvider.CreateScope();
        
        return _scope.ServiceProvider.GetRequiredService<T>();
    }
    
    private ServiceCollection ConfigureServices()
    {
        var services = new ServiceCollection();
        
        var environment = new HostingEnvironment
        {
            EnvironmentName = "Test"
        };

        services.AddApplicationDependencies();
        services.AddInfrastructure(environment);
        services.AddUtils();

        _connection = new SqliteConnection("Filename=:memory:");
        _connection.Open();
        services.AddDbContext<FoodDiaryContext>(options => options.UseSqlite(_connection));

        return services;
    }
}