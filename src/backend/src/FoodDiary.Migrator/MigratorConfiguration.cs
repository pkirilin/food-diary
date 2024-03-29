using Microsoft.Extensions.Configuration;

namespace FoodDiary.Migrator;

public static class MigratorConfiguration
{
    public static IConfiguration Configuration { get; }

    public static string? ConnectionString => Configuration["ConnectionStrings:Default"];
    
    static MigratorConfiguration()
    {
        Configuration = BuildConfiguration();
    }
    
    private static IConfiguration BuildConfiguration()
    {
        var builder = new ConfigurationBuilder()
            .AddJsonFile("appsettings.Migrator.json");
        
        var env = Environment.GetEnvironmentVariable("ENV");

        if (env == "Development")
        {
            builder.AddUserSecrets("041ffd97-30fe-4287-9696-0d9dc4be23c1");
        }

        return builder
            .AddEnvironmentVariables()
            .Build();
    }
}