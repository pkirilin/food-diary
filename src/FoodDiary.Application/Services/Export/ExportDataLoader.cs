using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Contracts.Export;
using FoodDiary.Domain.Abstractions.v2;

namespace FoodDiary.Application.Services.Export;

internal class ExportDataLoader : IExportDataLoader
{
    private readonly IFoodDiaryUnitOfWork _unitOfWork;

    public ExportDataLoader(IFoodDiaryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }
    
    public Task<ExportFileDto> LoadAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}