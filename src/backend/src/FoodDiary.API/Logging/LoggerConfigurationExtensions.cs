using System;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Serilog;
using Serilog.Formatting.Json;

namespace FoodDiary.API.Logging;

public static class LoggerConfigurationExtensions
{
    public static void Configure(
        this LoggerConfiguration loggerConfiguration,
        IServiceProvider serviceProvider)
    {
        var configuration = serviceProvider.GetRequiredService<IConfiguration>();
        
        if (configuration.GetSection("WriteLogsInJsonFormat").Get<bool>())
        {
            loggerConfiguration.WriteTo.Console(new JsonFormatter());
        }
        else
        {
            loggerConfiguration.WriteTo.Console();
        }
        
        loggerConfiguration.ReadFrom.Configuration(configuration);
    }
}