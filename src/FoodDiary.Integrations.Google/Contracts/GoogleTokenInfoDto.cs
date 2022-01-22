using System.Diagnostics.CodeAnalysis;
using System.Text.Json.Serialization;

namespace FoodDiary.Integrations.Google.Contracts;

[SuppressMessage("ReSharper", "UnusedAutoPropertyAccessor.Global")]
[SuppressMessage("ReSharper", "ClassNeverInstantiated.Global")]
public class GoogleTokenInfoDto
{
    [JsonPropertyName("email")]
    public string Email { get; set; }
}