using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace FoodDiary.IntegrationTests
{
    // TODO: remove in favor of System.Net.Http.Json
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

        public static async Task<string> GetStringAsync(this HttpClient client, string requestUri, CancellationToken cancellationToken = default)
        {
            var response = await client.GetAsync(requestUri, cancellationToken);
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            return content;
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

        public static async Task<HttpResponseMessage> PutDataAsync<TData>(this HttpClient client, string requestUri, TData data, bool ensureSuccessful = true, CancellationToken cancellationToken = default)
        {
            var body = new StringContent(JsonConvert.SerializeObject(data));
            body.Headers.ContentType = new MediaTypeHeaderValue("application/json");
            var response = await client.PutAsync(requestUri, body, cancellationToken);

            if (ensureSuccessful)
                response.EnsureSuccessStatusCode();

            return response;
        }

        public static async Task<HttpResponseMessage> SendDataAsync<TData>(this HttpClient client, string requestUri, HttpMethod method, TData data, bool ensureSuccessful = true, CancellationToken cancellationToken = default)
        {
            var request = new HttpRequestMessage
            {
                Method = method,
                RequestUri = new Uri($"{client.BaseAddress}{requestUri}"),
                Content = new StringContent(JsonConvert.SerializeObject(data))
                {
                    Headers =
                    {
                        ContentType = new MediaTypeHeaderValue("application/json")
                    }
                }
            };

            var response = await client.SendAsync(request, cancellationToken);

            if (ensureSuccessful)
                response.EnsureSuccessStatusCode();

            return response;
        }
    }
}
