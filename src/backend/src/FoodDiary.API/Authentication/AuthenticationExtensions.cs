using System;
using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.API.Authentication;

[SuppressMessage("ReSharper", "UnusedMethodReturnValue.Global")]
public static class AuthenticationExtensions
{
    public static AuthenticationBuilder AddCustomGoogle(
        this AuthenticationBuilder builder,
        string authenticationScheme,
        Action<GoogleOptions> configureOptions)
    {
        return builder.AddOAuth<GoogleOptions, CustomGoogleHandler>(
            authenticationScheme,
            GoogleDefaults.DisplayName,
            configureOptions);
    }
}