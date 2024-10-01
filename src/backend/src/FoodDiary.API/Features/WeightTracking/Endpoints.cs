using System;
using System.ComponentModel.DataAnnotations;
using System.Threading;
using FoodDiary.API.Features.WeightTracking.Contracts;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.API.Features.WeightTracking;

public static class Endpoints
{
    public static void MapWeightLogs(this IEndpointRouteBuilder app)
    {
        var weightLogs = app.MapGroup("/api/weight-logs");

        weightLogs.MapGet("/", (
                [Required] DateOnly? from,
                [Required] DateOnly? to,
                [FromServices] GetWeightLogsHandler handler,
                CancellationToken cancellationToken) =>
            handler.Handle(
                new GetWeightLogsRequest(from.GetValueOrDefault(), to.GetValueOrDefault()),
                cancellationToken));
        
        weightLogs.MapPost("/", (WeightLogBody request) => Results.Ok());
    }
    
    public static void AddWeightLogs(this IServiceCollection services)
    {
        services.AddScoped<GetWeightLogsHandler>();
    }
}