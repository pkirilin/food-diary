namespace FoodDiary.Export.GoogleDocs.Extensions;

public interface IGoogleDocsExportServiceBuilder
{
    IGoogleDocsExportService Build();
    
    IGoogleDocsExportServiceBuilder ConfigureDocsServiceHttpMessageHandler(HttpMessageHandler handler);
}