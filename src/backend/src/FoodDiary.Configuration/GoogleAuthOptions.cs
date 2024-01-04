namespace FoodDiary.Configuration;

public class GoogleAuthOptions
{
    public string ClientId { get; init; }
    public string ClientSecret { get; init; }
    public string AuthorizationEndpoint { get; init; }
    public string TokenEndpoint { get; init; }
    public string UserInformationEndpoint { get; init; }
}