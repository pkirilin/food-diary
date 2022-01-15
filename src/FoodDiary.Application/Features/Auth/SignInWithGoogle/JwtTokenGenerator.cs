using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FoodDiary.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace FoodDiary.Application.Features.Auth.SignInWithGoogle;

internal class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly IOptions<AuthOptions> _authOptions;

    public JwtTokenGenerator(IOptions<AuthOptions> authOptions)
    {
        _authOptions = authOptions;
    }
    
    public string GenerateToken(string email)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_authOptions.Value.JwtSecret);
        var expirationTimeSpan = TimeSpan.Parse(_authOptions.Value.JwtExpiration);
        
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email),
        };
        
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.Add(expirationTimeSpan),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };
        
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}