using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.API.Features.WeightTracking.Contracts;
using FoodDiary.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.API.Features.WeightTracking;

public class GetWeightLogsHandler(FoodDiaryContext context)
{
    public async Task<IResult> Handle(GetWeightLogsRequest request, CancellationToken cancellationToken)
    {
        var weightLogs = await context.WeightLogs
            .Where(wl => wl.Date >= request.From && wl.Date <= request.To)
            .OrderByDescending(wl => wl.Date)
            .Select(wl => wl.ToWeightLogItem())
            .ToListAsync(cancellationToken);
        
        var response = new GetWeightLogsResponse(weightLogs);
        
        return Results.Ok(response);
    }
}