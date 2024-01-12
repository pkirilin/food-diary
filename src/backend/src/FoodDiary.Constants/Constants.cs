namespace FoodDiary;

public static class Constants
{
    public static class AuthenticationSchemes
    {
        public const string OAuthGoogle = "oauth-google";
        public const string Cookie = "fd-auth";
    }

    public static class AuthenticationParameters
    {
        public static readonly TimeSpan CookieLifetime = TimeSpan.FromHours(1);
        public static readonly TimeSpan AccessTokenRefreshInterval = TimeSpan.FromHours(1);
    }

    public static class AuthorizationPolicies
    {
        public const string GoogleAllowedEmails = "GoogleAllowedEmails";
    }

    public static class ClaimTypes
    {
        public const string Email = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
    }

    public static class OpenIdConnectParameters
    {
        public const string AccessToken = "access_token";
        public const string IdToken = "id_token";
        public const string RefreshToken = "refresh_token";
        public const string TokenType = "token_type";
        public const string ExpiresAt = "expires_at";
    }
}
