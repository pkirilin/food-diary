namespace FoodDiary.API;

public static class Constants
{
    public static class AuthenticationSchemes
    {
        public const string OAuthGoogle = "oauth-google";
        public const string Cookie = "fd-auth";
    }

    public static class AuthorizationPolicies
    {
        public const string GoogleAllowedEmails = "GoogleAllowedEmails";
    }

    public static class ClaimTypes
    {
        public const string Email = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
    }
}