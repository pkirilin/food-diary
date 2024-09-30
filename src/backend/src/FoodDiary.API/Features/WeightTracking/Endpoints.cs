using System;
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
        weightLogs.MapGet("/", (GetWeightLogsRequest request) => Results.Ok(new GetWeightLogsResponse(Array.Empty<WeightLogItem>())));
        weightLogs.MapPost("/", (WeightLogBody request) => Results.Ok());
    }
}