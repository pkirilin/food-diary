using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Contracts.Export;
using FoodDiary.Contracts.Export.Json;

namespace FoodDiary.Application.Services.Export;

public interface IExportDataLoader
{
    Task<ExportFileDto> GetDataAsync(DateOnly startDate, DateOnly endDate, CancellationToken cancellationToken);

    Task<JsonExportFileDto> GetJsonDataAsync(DateOnly startDate, DateOnly endDate, CancellationToken cancellationToken);
}