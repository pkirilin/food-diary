using System.Diagnostics.CodeAnalysis;

namespace FoodDiary.Configuration;

[SuppressMessage("ReSharper", "UnusedAutoPropertyAccessor.Global")]
public class AuthOptions
{
    public IEnumerable<string> AllowedEmails { get; set; }
    
    public string JwtSecret { get; set; }

    public int JwtExpirationDays { get; set; }
}
