using FoodDiary.Migrator;
using JetBrains.Annotations;
using Npgsql;
using Testcontainers.PostgreSql;

namespace FoodDiary.ComponentTests.Infrastructure.DataAccess;

[UsedImplicitly]
public class DatabaseFixture
{
    private readonly PostgreSqlContainer _dbContainer = new PostgreSqlBuilder()
        .WithImage("postgres:15.1-alpine")
        .WithUsername("postgres")
        .WithPassword("postgres")
        .WithDatabase("food-diary")
        .Build();

    public string ConnectionString => _dbContainer.GetConnectionString();
    
    public async Task Start()
    {
        await _dbContainer.StartAsync();
        await MigrationRunner.RunMigrations([ConnectionString]);
    }

    public Task Stop()
    {
        return _dbContainer.StopAsync();
    }

    public async Task Clear()
    {
        await using var connection = new NpgsqlConnection(ConnectionString);
        await connection.OpenAsync();

        var command = connection.CreateCommand();
        command.CommandText = """
                              truncate table "Notes" cascade;
                              truncate table "Products" cascade;
                              truncate table "Categories" cascade;
                              """;

        await command.ExecuteScalarAsync();
    }
}