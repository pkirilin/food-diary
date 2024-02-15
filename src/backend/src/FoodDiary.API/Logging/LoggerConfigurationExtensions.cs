using System;
using FoodDiary.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
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
        var appOptions = serviceProvider.GetRequiredService<IOptions<AppOptions>>().Value;
        
        loggerConfiguration
            .ReadFrom.Configuration(configuration)
            .WriteToConsole(appOptions);
    }

    private static void WriteToConsole(this LoggerConfiguration loggerConfiguration, AppOptions appOptions)
    {
        if (!appOptions.Logging.WriteLogsInJsonFormat)
        {
            loggerConfiguration.WriteTo.Console();
            return;
        }

        if (appOptions.Logging.UseYandexCloudLogsFormat)
        {
            loggerConfiguration.WriteTo.Console(new YandexCloudJsonFormatter());
            return;
        }
        
        loggerConfiguration.WriteTo.Console(new JsonFormatter());
    }
}