using System.Net;
using FoodDiary.API.Mcp.Authorization.Cimd;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.ComponentTests.Infrastructure.ExternalServices;
using JetBrains.Annotations;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.ComponentTests.Scenarios.Mcp;

[UsedImplicitly]
public class McpCimdFetchingContext(FoodDiaryWebApplicationFactory factory, ExternalServicesFixture externalServices)
    : McpContext(factory, externalServices)
{
    public async Task Given_cimd_client_metadata_document_is_not_found()
    {
        await StartMetadataHostReachableOverLoopback();
        await MetadataHost.SetupStatus(CimdDocumentPath, HttpStatusCode.NotFound);
    }

    public async Task Given_cimd_client_metadata_document_redirects_to_another_url()
    {
        const string redirectTargetPath = "/moved-oauth-client.json";

        await StartMetadataHostReachableOverLoopback();
        await MetadataHost.SetupStatus(CimdDocumentPath, HttpStatusCode.Found, new Dictionary<string, object>
        {
            ["Location"] = McpClientMetadataHost.UrlOf(redirectTargetPath)
        });
        await MetadataHost.SetupDocument(redirectTargetPath, CimdDocument());
    }

    public async Task Given_cimd_client_metadata_document_responds_after(int seconds)
    {
        await StartMetadataHostReachableOverLoopback();
        await MetadataHost.SetupDocument(CimdDocumentPath, CimdDocument(), latencyInMilliseconds: seconds * 1000);
    }

    public async Task Given_cimd_client_metadata_document_larger_than_5_kb()
    {
        var document = CimdDocument();
        document["client_name"] = new string('a', 5 * 1024);

        await StartMetadataHostReachableOverLoopback();
        await MetadataHost.SetupDocument(CimdDocumentPath, document);
    }

    public async Task Given_cimd_client_metadata_document_is_not_json()
    {
        await StartMetadataHostReachableOverLoopback();
        await MetadataHost.SetupBody(CimdDocumentPath, "client_name=Test MCP Client");
    }

    public async Task Given_cimd_client_metadata_document_served_as(string contentType)
    {
        await StartMetadataHostReachableOverLoopback();
        await MetadataHost.SetupDocument(CimdDocumentPath, CimdDocument(), contentType: contentType);
    }

    public async Task Given_cimd_client_metadata_document_served_with_untrusted_certificate()
    {
        await MetadataHost.Start();
        Factory = Factory.WithWebHostBuilder(builder => builder.ConfigureTestServices(services =>
            services.AddSingleton<ICimdAddressFilter, LoopbackAllowedAddressFilter>()));
        await MetadataHost.SetupDocument(CimdDocumentPath, CimdDocument());
    }

    public Task Given_cimd_client_metadata_document_without(string field)
    {
        var document = CimdDocument();
        document.Remove(field);

        return ServeCimdDocument(document);
    }

    public async Task Given_cimd_client_metadata_document_behind_real_address_filter()
    {
        await MetadataHost.Start();
        Factory = Factory.WithWebHostBuilder(builder => builder.ConfigureTestServices(TrustMetadataHostCertificate));
        await MetadataHost.SetupDocument(CimdDocumentPath, CimdDocument());
    }
}
