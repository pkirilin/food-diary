using System;
using WireMock.Server;

namespace FoodDiary.IntegrationTests.MockApis;

// ReSharper disable once ClassNeverInstantiated.Global
public class GoogleMockApi : IDisposable
{
    public WireMockServer Server { get; }

    public GoogleMockApi()
    {
        Server = WireMockServer.Start(10000);
    }

    public void Dispose()
    {
        Server.Stop();
        Server.Dispose();
    }
}