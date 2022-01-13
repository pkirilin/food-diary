using System.Text.Json.Serialization;

namespace FoodDiary.Integrations.Google.Contracts;

public class GoogleTokenInfoDto
{
    [JsonPropertyName("email")]
    public string Email { get; set; }
}