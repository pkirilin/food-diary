namespace FoodDiary.Export.GoogleDocs.Extensions;

internal class GoogleDocsExportServiceBuilder : IGoogleDocsExportServiceBuilder
{
    private readonly DocsServiceHttpClientFactory _docsServiceHttpClientFactory = new();
    
    public IGoogleDocsExportService Build()
    {
        return new GoogleDocsExportService(_docsServiceHttpClientFactory);
    }

    public IGoogleDocsExportServiceBuilder ConfigureDocsServiceHttpMessageHandler(HttpMessageHandler handler)
    {
        _docsServiceHttpClientFactory.WithHttpMessageHandler(handler);
        return this;
    }
}