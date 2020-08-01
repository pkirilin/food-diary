using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace FoodDiary.IntegrationTests
{
    public static class HttpClientExtensions
    {
        public static async Task<TData> GetDataAsync<TData>(this HttpClient client, string requestUri, CancellationToken cancellationToken = default)
        {
            var response = await client.GetAsync(requestUri, cancellationToken);
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            var data = JsonConvert.DeserializeObject<TData>(content);
            return data;
        }

        public static async Task<HttpResponseMessage> PostDataAsync<TData>(this HttpClient client, string requestUri, TData data, bool ensureSuccessful = true, CancellationToken cancellationToken = default)
        {
            var body = new StringContent(JsonConvert.SerializeObject(data));
            body.Headers.ContentType = new MediaTypeHeaderValue("application/json");
            var response = await client.PostAsync(requestUri, body, cancellationToken);

            if (ensureSuccessful)
                response.EnsureSuccessStatusCode();

            return response;
        }
    }
}
