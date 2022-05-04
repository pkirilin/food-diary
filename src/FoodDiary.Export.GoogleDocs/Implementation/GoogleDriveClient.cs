using Google.Apis.Auth.OAuth2;
using Google.Apis.Docs.v1.Data;
using Google.Apis.Drive.v3;
using Google.Apis.Services;
using File = Google.Apis.Drive.v3.Data.File;

namespace FoodDiary.Export.GoogleDocs.Implementation;

internal class GoogleDriveClient : IGoogleDriveClient
{
    private const string ApplicationName = "food-diary";
    private const string FolderId = "126eWwd7qUmoG3Jy1SbcpcxZMm9zLBwSe";

    public async Task SaveDocumentAsync(Document document, string accessToken, CancellationToken cancellationToken)
    {
        var service = CreateService(accessToken);
        
        var file = new File
        {
            Name = document.Title,
            Parents = new List<string> { FolderId }
        };
        
        await service.Files
            .Copy(file, document.DocumentId)
            .ExecuteAsync(cancellationToken);
        
        await service.Files
            .Delete(document.DocumentId)
            .ExecuteAsync(cancellationToken);
    }

    private static DriveService CreateService(string accessToken)
    {
        return new DriveService(new BaseClientService.Initializer
        {
            HttpClientInitializer = GoogleCredential.FromAccessToken(accessToken),
            ApplicationName = ApplicationName
        });
    }
}