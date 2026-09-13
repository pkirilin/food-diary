namespace FoodDiary.API.Mcp;

public class McpOptions
{
    public const string SectionName = "Mcp";

    public bool Enabled { get; set; }

    public string? BaseUrl { get; set; }

    public IReadOnlyList<McpClientRegistration> Clients { get; set; } = [];

    public TimeSpan AccessTokenLifetime { get; set; } = TimeSpan.FromHours(1);

    public TimeSpan RefreshTokenLifetime { get; set; } = TimeSpan.FromDays(30);
}
