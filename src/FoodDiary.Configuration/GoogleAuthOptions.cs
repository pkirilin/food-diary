namespace FoodDiary.Configuration;

public class GoogleAuthOptions
{
    public string Authority { get; set; }
    public string ClientId { get; set; }
    public string[] ValidIssuers { get; set; }
}