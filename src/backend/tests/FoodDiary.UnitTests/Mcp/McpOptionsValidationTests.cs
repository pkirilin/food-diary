using FoodDiary.API.Mcp;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace FoodDiary.UnitTests.Mcp;

public class McpOptionsValidationTests
{
    private static Dictionary<string, string?> EnabledWithOneClient() => new()
    {
        ["Mcp:Enabled"] = "true",
        ["Mcp:BaseUrl"] = "https://diary.example.com",
        ["Mcp:Clients:0:ClientId"] = "claude",
        ["Mcp:Clients:0:ClientSecret"] = "secret",
        ["Mcp:Clients:0:RedirectUri"] = "https://claude.ai/api/mcp/auth_callback"
    };

    private static void AddSecondClient(Dictionary<string, string?> settings, string clientId)
    {
        settings["Mcp:Clients:1:ClientId"] = clientId;
        settings["Mcp:Clients:1:ClientSecret"] = "another-secret";
        settings["Mcp:Clients:1:RedirectUri"] = "http://localhost:6274/oauth/callback";
    }

    private static IConfiguration ShippedAppSettingsWith(Dictionary<string, string?> overrides) =>
        new ConfigurationBuilder()
            .AddJsonFile(Path.Combine(AppContext.BaseDirectory, "appsettings.json"))
            .AddInMemoryCollection(overrides)
            .Build();

    private static ServiceProvider BuildServices(IConfiguration configuration)
    {
        var services = new ServiceCollection();
        services.AddFoodDiaryMcp(configuration);
        return services.BuildServiceProvider();
    }

    private static Action ValidateOnStartup(Dictionary<string, string?> settings) =>
        BuildServices(new ConfigurationBuilder().AddInMemoryCollection(settings).Build())
            .GetRequiredService<IStartupValidator>()
            .Validate;

    [Fact]
    public void ShippedAppSettings_StartDisabledWithHourLongAccessAndMonthLongRefreshTokens()
    {
        using var services = BuildServices(ShippedAppSettingsWith([]));

        var validate = services.GetRequiredService<IStartupValidator>().Validate;
        var options = services.GetRequiredService<IOptions<McpOptions>>().Value;

        validate.Should().NotThrow();
        options.Enabled.Should().BeFalse();
        options.AccessTokenLifetime.Should().Be(TimeSpan.Parse("01:00:00"));
        options.RefreshTokenLifetime.Should().Be(TimeSpan.Parse("30.00:00:00"));
    }

    [Fact]
    public void ShippedAppSettings_EnabledWithBaseUrlClientIdAndSecret_RegistersClaudeCallback()
    {
        using var services = BuildServices(ShippedAppSettingsWith(new()
        {
            ["Mcp:Enabled"] = "true",
            ["Mcp:BaseUrl"] = "https://diary.example.com",
            ["Mcp:Clients:0:ClientId"] = "claude",
            ["Mcp:Clients:0:ClientSecret"] = "secret"
        }));

        var validate = services.GetRequiredService<IStartupValidator>().Validate;
        var options = services.GetRequiredService<IOptions<McpOptions>>().Value;

        validate.Should().NotThrow();
        options.Clients.Should().ContainSingle()
            .Which.RedirectUri.Should().Be("https://claude.ai/api/mcp/auth_callback");
    }

    [Fact]
    public void Enabled_WithBaseUrlAndOneCompleteClient_Passes()
    {
        var validate = ValidateOnStartup(EnabledWithOneClient());

        validate.Should().NotThrow();
    }

    [Fact]
    public void Enabled_WithoutClients_FailsNamingClients()
    {
        var settings = EnabledWithOneClient();
        settings.Remove("Mcp:Clients:0:ClientId");
        settings.Remove("Mcp:Clients:0:ClientSecret");
        settings.Remove("Mcp:Clients:0:RedirectUri");

        var validate = ValidateOnStartup(settings);

        validate.Should().Throw<OptionsValidationException>()
            .Which.Failures.Should().Contain("Mcp:Clients requires at least one client");
    }

    [Theory]
    [InlineData("ClientId")]
    [InlineData("ClientSecret")]
    [InlineData("RedirectUri")]
    public void Enabled_WithClientFieldBlank_FailsNamingClientIndexAndField(string field)
    {
        var settings = EnabledWithOneClient();
        AddSecondClient(settings, clientId: "inspector");
        settings[$"Mcp:Clients:1:{field}"] = " ";

        var validate = ValidateOnStartup(settings);

        validate.Should().Throw<OptionsValidationException>()
            .Which.Failures.Should().Contain($"Mcp:Clients:1:{field} is required");
    }

    [Fact]
    public void Enabled_WithDuplicateClientId_FailsNamingBothIndexes()
    {
        var settings = EnabledWithOneClient();
        AddSecondClient(settings, clientId: "claude");

        var validate = ValidateOnStartup(settings);

        validate.Should().Throw<OptionsValidationException>()
            .Which.Failures.Should().Contain("Mcp:Clients:1:ClientId duplicates Mcp:Clients:0:ClientId");
    }

    public static TheoryData<string, string> MalformedUrls => new()
    {
        { "diary.example.com", "must be an absolute URL" },
        { "/mcp", "must be an absolute URL" },
        { "http://diary.example.com", "must use https; http is allowed only for localhost" },
        { "http://127.0.0.1", "must use https; http is allowed only for localhost" },
        { "ftp://diary.example.com", "must use https; http is allowed only for localhost" },
        { "https://diary.example.com?tenant=1", "must not have a query or fragment" },
        { "https://diary.example.com#top", "must not have a query or fragment" },
        { "https://diary.example.com/", "must not end with a slash" },
        { "https://diary.example.com/ ", "must not have leading or trailing whitespace" }
    };

    [Theory]
    [MemberData(nameof(MalformedUrls))]
    public void Enabled_WithMalformedBaseUrl_FailsNamingBaseUrl(string baseUrl, string expectedReason)
    {
        var settings = EnabledWithOneClient();
        settings["Mcp:BaseUrl"] = baseUrl;

        var validate = ValidateOnStartup(settings);

        validate.Should().Throw<OptionsValidationException>()
            .Which.Failures.Should().Contain($"Mcp:BaseUrl {expectedReason}");
    }

    [Theory]
    [InlineData("https://diary.example.com/food")]
    [InlineData("https://diary.example.com/mcp")]
    public void Enabled_WithBaseUrlPath_FailsNamingBaseUrl(string baseUrl)
    {
        var settings = EnabledWithOneClient();
        settings["Mcp:BaseUrl"] = baseUrl;

        var validate = ValidateOnStartup(settings);

        validate.Should().Throw<OptionsValidationException>()
            .Which.Failures.Should().Contain("Mcp:BaseUrl must be an origin without a path");
    }

    [Theory]
    [MemberData(nameof(MalformedUrls))]
    public void Enabled_WithMalformedRedirectUri_FailsNamingClientIndex(string redirectUri, string expectedReason)
    {
        var settings = EnabledWithOneClient();
        settings["Mcp:Clients:0:RedirectUri"] = redirectUri;

        var validate = ValidateOnStartup(settings);

        validate.Should().Throw<OptionsValidationException>()
            .Which.Failures.Should().Contain($"Mcp:Clients:0:RedirectUri {expectedReason}");
    }

    [Theory]
    [InlineData("http://localhost")]
    [InlineData("http://localhost:5000")]
    public void Enabled_WithWellFormedBaseUrl_Passes(string baseUrl)
    {
        var settings = EnabledWithOneClient();
        settings["Mcp:BaseUrl"] = baseUrl;

        var validate = ValidateOnStartup(settings);

        validate.Should().NotThrow();
    }

    [Fact]
    public void Enabled_WithoutBaseUrl_FailsNamingBaseUrl()
    {
        var settings = EnabledWithOneClient();
        settings.Remove("Mcp:BaseUrl");

        var validate = ValidateOnStartup(settings);

        validate.Should().Throw<OptionsValidationException>()
            .Which.Failures.Should().Contain("Mcp:BaseUrl is required");
    }
}
