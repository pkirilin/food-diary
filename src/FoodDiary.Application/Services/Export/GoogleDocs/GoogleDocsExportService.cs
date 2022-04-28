using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Services.Export.GoogleDocs;

internal class GoogleDocsExportService : IGoogleDocsExportService
{
    public Task ExportAsync(IEnumerable<Page> pages, string accessToken, CancellationToken cancellationToken)
    {
        throw new System.NotImplementedException();
    }
}