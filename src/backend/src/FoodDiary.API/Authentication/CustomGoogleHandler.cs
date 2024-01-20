using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Primitives;

namespace FoodDiary.API.Authentication;

public class CustomGoogleHandler(IOptionsMonitor<GoogleOptions> options, ILoggerFactory logger, UrlEncoder encoder)
    : GoogleHandler(options, logger, encoder)
{
    protected override string BuildChallengeUrl(AuthenticationProperties properties, string redirectUri)
    {
        var query = QueryHelpers.ParseQuery(new Uri(base.BuildChallengeUrl(properties, redirectUri)).Query);
        
        SetQueryParam(query, properties, OAuthChallengeProperties.ScopeKey, base.FormatScope, Options.Scope);
        SetQueryParam(query, properties, GoogleChallengeProperties.AccessTypeKey, Options.AccessType);
        SetQueryParam(query, properties, GoogleChallengeProperties.ApprovalPromptKey);
        SetQueryParam(query, properties, GoogleChallengeProperties.PromptParameterKey, "select_account consent");
        SetQueryParam(query, properties, GoogleChallengeProperties.LoginHintKey);
        SetQueryParam(query, properties, GoogleChallengeProperties.IncludeGrantedScopesKey, v => v?.ToString(CultureInfo.InvariantCulture).ToLowerInvariant(), new bool?());
        
        query["state"] = (StringValues) Options.StateDataFormat.Protect(properties);
        
        return QueryHelpers.AddQueryString(Options.AuthorizationEndpoint, query);
    }
    
    private static void SetQueryParam<T>(
        IDictionary<string, StringValues> queryStrings,
        AuthenticationProperties properties,
        string name,
        Func<T, string> formatter,
        T defaultValue)
    {
        var parameter = properties.GetParameter<T>(name);
        string str;
        if (parameter != null)
            str = formatter(parameter);
        else if (!properties.Items.TryGetValue(name, out str))
            str = formatter(defaultValue);
        properties.Items.Remove(name);
        if (str == null)
            return;
        queryStrings[name] = (StringValues) str;
    }

    private static void SetQueryParam(
        IDictionary<string, StringValues> queryStrings,
        AuthenticationProperties properties,
        string name,
        string? defaultValue = null)
    {
        SetQueryParam(queryStrings, properties, name, (Func<string, string>) (x => x), defaultValue);
    }
}