namespace FoodDiary.API.Mcp.Authorization.Cimd;

internal static class CimdServiceCollectionExtensions
{
    private const int MaxDocumentBytes = 5 * 1024;
    
    extension(IServiceCollection services)
    {
        public void AddCimd()
        {
            services.AddSingleton<CimdClientValidator>();
            services.AddCimdMetadataDocumentFetcher();
        }

        private void AddCimdMetadataDocumentFetcher()
        {
            services.AddSingleton<ICimdAddressFilter, SpecialUseAddressFilter>();
            services.AddSingleton<CimdMetadataDocumentFetcher>();

            services.AddHttpClient(CimdMetadataDocumentFetcher.HttpClientName, client =>
                {
                    client.Timeout = TimeSpan.FromSeconds(5);
                    client.MaxResponseContentBufferSize = MaxDocumentBytes;
                })
                .UseSocketsHttpHandler((handler, serviceProvider) =>
                {
                    var addressFilter = serviceProvider.GetRequiredService<ICimdAddressFilter>();

                    // A proxy would make ConnectCallback dial the proxy, leaving the target address unchecked
                    handler.UseProxy = false;
                    handler.AllowAutoRedirect = false;
                    handler.UseCookies = false;
                    handler.ConnectCallback = (context, cancellationToken) => CimdMetadataDocumentFetcher
                        .ConnectToAllowedAddress(context.DnsEndPoint, addressFilter, cancellationToken);
                });
        }
    }
}