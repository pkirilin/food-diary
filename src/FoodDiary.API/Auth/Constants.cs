namespace FoodDiary.API.Auth;

public static class Constants
{
    public static class Schemes
    {
        public const string GoogleJwt = "GoogleJwt";
    }
    
    public static class Policies
    {
        public const string GoogleJwt = "GoogleJwtPolicy";
    }
    
    public static class ClaimTypes
    {
        public const string Email = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
    }
}