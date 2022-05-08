using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Contracts.Export;

namespace FoodDiary.Application.Services.Export;

public interface IExportDataLoader
{
    Task<ExportFileDto> GetExportDataAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken);
}