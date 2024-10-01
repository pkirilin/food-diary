using System;
using System.ComponentModel.DataAnnotations;
using FoodDiary.API.Features.WeightTracking.Contracts;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace FoodDiary.API.Features.WeightTracking;

public static class Endpoints
{
    public static void MapWeightLogs(this IEndpointRouteBuilder app)
    {
        var weightLogs = app.MapGroup("/api/weight-logs");

        weightLogs.MapGet("/", ([Required] DateOnly? from, [Required] DateOnly? to) =>
        {
            var response = new GetWeightLogsResponse(Array.Empty<WeightLogItem>());
            return Results.Ok(response);
        });
        
        weightLogs.MapPost("/", (WeightLogBody request) => Results.Ok());
    }
}