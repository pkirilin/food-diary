using System.IO;
using FoodDiary.API;
using FoodDiary.Export.GoogleDocs.Extensions;
using FoodDiary.Infrastructure;
using FoodDiary.Integrations.Google.Extensions;
using FoodDiary.IntegrationTests.Database;
using FoodDiary.IntegrationTests.Dsl.Builders;
using FoodDiary.IntegrationTests.Fakes;
using Google.Apis.Docs.v1.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.IntegrationTests;

// ReSharper disable once ClassNeverInstantiated.Global
public class FoodDiaryWebApplicationFactory : WebApplicationFactory<Startup>
{
    private SqliteConnection _connection;
    private IServiceScope _scope;
    private FoodDiaryContext _dbContext;

    public FoodDiaryWebApplicationFactory()
    {
        _dbContext = DbContext;
    }
    
    public SeedDataForDbContextBuilder SeedDatabase() => new(DbContext);

    public void ClearDatabase()
    {
        _connection?.Close();
        _connection?.Open();
        DbContext.ChangeTracker.Clear();
        DbContext.Database.EnsureCreated();
    }

    public FakeGoogleDriveClient CreateFakeGoogleDriveClient()
    {
        return new FakeGoogleDriveClient();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        if (_connection == null)
        {
            _connection = new SqliteConnection("Filename=:memory:");
            _connection.Open();
        }

        builder.UseEnvironment("Test");

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", true, true)
                .AddJsonFile("appsettings.Test.json", false, false);
        });

        builder.ConfigureTestServices(services =>
        {
            services.AddDbContext<FoodDiaryContext>(
                options => options.UseSqlite(_connection),
                ServiceLifetime.Singleton);
            
            services.AddAuthentication("Test")
                .AddScheme<AuthenticationSchemeOptions, FakeAuthHandler>("Test", _ => {});

            services.AddGoogleOAuthClient()
                .ConfigurePrimaryHttpMessageHandler(() => new FakeHttpMessageHandler());

            services.AddGoogleDocsExportService(exportBuilder =>
            {
                var handler = new FakeHttpMessageHandler();
                handler.WithSuccessStatusCode();
                handler.WithJsonResponse(new Document
                {
                    DocumentId = "test_google_document_id"
                });
                
                return exportBuilder.ConfigureDocsServiceHttpMessageHandler(handler);
            });
        });
    }
    
    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _connection?.Close();
            _scope?.Dispose();
        }
        
        base.Dispose(disposing);
    }

    private FoodDiaryContext DbContext
    {
        get
        {
            if (_dbContext != null)
                return _dbContext;

            var serviceScopeFactory = Services.GetRequiredService<IServiceScopeFactory>();
            _scope = serviceScopeFactory.CreateScope();
            _dbContext = _scope.ServiceProvider.GetRequiredService<FoodDiaryContext>();
            _dbContext.Database.EnsureCreated();
            TestDatabaseUtils.Initialize(_dbContext);
            return _dbContext;
        }
    }
}