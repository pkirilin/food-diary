namespace FoodDiary.Export.GoogleDocs.Extensions;

internal class GoogleDocsExportServiceBuilder : IGoogleDocsExportServiceBuilder
{
    private readonly DocsServiceHttpClientFactory _docsServiceHttpClientFactory = new();
    private readonly DriveServiceHttpClientFactory _driveServiceHttpClientFactory = new();
    
    public IGoogleDocsExportService Build()
    {
        return new GoogleDocsExportService(_docsServiceHttpClientFactory, _driveServiceHttpClientFactory);
    }

    public IGoogleDocsExportServiceBuilder ConfigureDocsServiceHttpMessageHandler(HttpMessageHandler handler)
    {
        _docsServiceHttpClientFactory.WithHttpMessageHandler(handler);
        return this;
    }

    public IGoogleDocsExportServiceBuilder ConfigureDriveServiceHttpMessageHandler(HttpMessageHandler handler)
    {
        _driveServiceHttpClientFactory.WithHttpMessageHandler(handler);
        return this;
    }
}