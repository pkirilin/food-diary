using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.API.Features.WeightTracking.Contracts;
using Microsoft.AspNetCore.Http;

namespace FoodDiary.API.Features;

public class GetWeightLogsHandler
{
    public async Task<IResult> Handle(GetWeightLogsRequest request, CancellationToken cancellationToken)
    {
        var response = new GetWeightLogsResponse(Array.Empty<WeightLogItem>());
        return Results.Ok(response);
    }
}