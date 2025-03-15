using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Containers;
using JetBrains.Annotations;
using LightBDD.Core.Execution;
using MbDotNet;

namespace FoodDiary.ComponentTests.Infrastructure.ExternalServices;

[UsedImplicitly]
public class ExternalServicesFixture : IGlobalResourceSetUp
{
    private static readonly IContainer MountebankContainer = new ContainerBuilder()
        .WithImage("bbyars/mountebank:2.9.1")
        .WithPortBinding(2525, 2525)
        .WithPortBinding(GoogleIdentityProvider.Port, GoogleIdentityProvider.Port)
        .WithPortBinding(OpenAIApi.Port, OpenAIApi.Port)
        .Build();
    
    private static readonly IClient MountebankClient = new MountebankClient(
        new Uri("http://localhost:2525", UriKind.Absolute));

    public GoogleIdentityProvider GoogleIdentityProvider { get; } = new(MountebankClient);
    public OpenAIApi OpenAiApi { get; } = new(MountebankClient);

    public Task SetUpAsync()
    {
        return MountebankContainer.StartAsync();
    }

    public Task TearDownAsync()
    {
        return MountebankContainer.StopAsync();
    }
}