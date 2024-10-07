using System.Threading;
using System.Threading.Tasks;
using FoodDiary.API.Features.WeightTracking.Contracts;
using FoodDiary.Domain.WeightTracking;
using FoodDiary.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.API.Features.WeightTracking;

public class AddWeightLogHandler(FoodDiaryContext context)
{
    public async Task<IResult> Handle(WeightLogBody request, CancellationToken cancellationToken)
    {
        var weightLogExists = await context.WeightLogs.AnyAsync(wl => wl.Date == request.Date, cancellationToken);
        
        if (weightLogExists)
        {
            return Results.Problem(
                title: "Failed to add weight log",
                detail: "Weight log with such date already exists, please choose another date");
        }
        
        var weightLog = new WeightLog
        {
            Date = request.Date.GetValueOrDefault(),
            Weight = request.Value
        };
        
        await context.WeightLogs.AddAsync(weightLog, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
        return Results.Ok();
    }
}