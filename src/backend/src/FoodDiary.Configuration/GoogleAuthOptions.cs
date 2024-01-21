namespace FoodDiary.Configuration;

public class GoogleAuthOptions
{
    public required string ClientId { get; init; }
    public required string ClientSecret { get; init; }
    public required string TokenEndpoint { get; init; }
    public required string UserInformationEndpoint { get; init; }
}