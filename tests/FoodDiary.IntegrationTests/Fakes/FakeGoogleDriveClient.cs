using Google.Apis.Drive.v3.Data;

namespace FoodDiary.IntegrationTests.Fakes;

public class FakeGoogleDriveClient
{
    public File[] GetFiles()
    {
        return new File[0];
    }
}