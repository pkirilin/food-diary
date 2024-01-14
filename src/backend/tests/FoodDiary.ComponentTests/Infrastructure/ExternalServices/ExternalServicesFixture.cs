using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Containers;
using JetBrains.Annotations;
using MbDotNet;

namespace FoodDiary.ComponentTests.Infrastructure.ExternalServices;

[UsedImplicitly]
public class ExternalServicesFixture : IAsyncLifetime
{
    private readonly IContainer _mountebankContainer = new ContainerBuilder()
        .WithImage("bbyars/mountebank:2.9.1")
        .WithPortBinding(2525, 2525)
        .WithPortBinding(GoogleIdentityProvider.Port, GoogleIdentityProvider.Port)
        .Build();
    
    private readonly IClient _mountebankClient = new MountebankClient(
        new Uri("http://localhost:2525", UriKind.Absolute));

    public GoogleIdentityProvider GoogleIdentityProvider => new(_mountebankClient);

    public async Task InitializeAsync()
    {
        await _mountebankContainer.StartAsync();
    }

    public async Task DisposeAsync()
    {
        await _mountebankContainer.StopAsync();
    }
}