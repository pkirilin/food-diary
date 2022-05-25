using System.IO;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Export.GoogleDocs;

namespace FoodDiary.Application.Services.Export;

internal class ExportService : IExportService
{
    private readonly IExportDataLoader _exportDataLoader;
    private readonly IGoogleDocsExportService _googleDocsService;

    public ExportService(IExportDataLoader exportDataLoader, IGoogleDocsExportService googleDocsService)
    {
        _exportDataLoader = exportDataLoader;
        _googleDocsService = googleDocsService;
    }
    
    public async Task<ExportToGoogleDocsResponseDto> ExportToGoogleDocsAsync(ExportToGoogleDocsRequestDto request,
        CancellationToken cancellationToken)
    {
        var exportFileDto = await _exportDataLoader.GetDataAsync(request.StartDate,
            request.EndDate,
            cancellationToken);

        var documentId = await _googleDocsService.ExportAsync(exportFileDto, request.AccessToken, cancellationToken);

        return new ExportToGoogleDocsResponseDto
        {
            DocumentId = documentId
        };
    }

    public async Task<byte[]> ExportToJsonAsync(ExportRequestDto request, CancellationToken cancellationToken)
    {
        var exportFileDto = await _exportDataLoader.GetJsonDataAsync(request.StartDate,
            request.EndDate,
            cancellationToken);

        using var stream = new MemoryStream();
        
        var serializerOptions = new JsonSerializerOptions
        { 
            WriteIndented = true, 
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
        };

        await JsonSerializer.SerializeAsync(stream, exportFileDto, serializerOptions, cancellationToken);
        return stream.ToArray();
    }
}