using System.Collections.Generic;
using System.Linq;

namespace FoodDiary.IntegrationTests.Fakes;

public class FakeGoogleDriveStorage
{
    // ReSharper disable once CollectionNeverUpdated.Local
    private readonly List<FakeGoogleDriveFile> _fakeFiles = new();

    public FakeGoogleDriveFile? GetFile(string fileId)
    {
        return _fakeFiles.FirstOrDefault(f => f.Id == fileId);
    }

    public void Save(FakeGoogleDriveFile file)
    {
        _fakeFiles.Add(file);
    }
}