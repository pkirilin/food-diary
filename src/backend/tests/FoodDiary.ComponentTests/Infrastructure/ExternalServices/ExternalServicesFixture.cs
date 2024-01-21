using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Containers;
using JetBrains.Annotations;
using MbDotNet;

namespace FoodDiary.ComponentTests.Infrastructure.ExternalServices;

[UsedImplicitly]
public class ExternalServicesFixture : IAsyncLifetime
{
    private static readonly IContainer MountebankContainer = new ContainerBuilder()
        .WithImage("bbyars/mountebank:2.9.1")
        .WithPortBinding(2525, 2525)
        .WithPortBinding(GoogleIdentityProvider.Port, GoogleIdentityProvider.Port)
        .Build();
    
    private static readonly IClient MountebankClient = new MountebankClient(
        new Uri("http://localhost:2525", UriKind.Absolute));

    public GoogleIdentityProvider GoogleIdentityProvider { get; } = new(MountebankClient);

    public Task InitializeAsync()
    {
        return MountebankContainer.StartAsync();
    }

    public Task DisposeAsync()
    {
        return MountebankContainer.StopAsync();
    }
}