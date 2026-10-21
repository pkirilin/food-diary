using System.Net;
using System.Text.Json;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.ComponentTests.Infrastructure.ExternalServices;
using FoodDiary.Domain.Entities;
using JetBrains.Annotations;
using ModelContextProtocol.Protocol;

namespace FoodDiary.ComponentTests.Scenarios.Mcp;

[UsedImplicitly]
public class McpServerContext(FoodDiaryWebApplicationFactory factory, ExternalServicesFixture externalServices)
    : McpContext(factory, externalServices)
{
    private Implementation _connectedServer = null!;
    private List<string> _listedPromptNames = [];
    private GetPromptResult _promptResult = null!;

    public Task Given_access_token_was_issued()
    {
        return Given_access_token_was_issued_to(AllowedUserEmail);
    }

    public Task Given_access_token_was_issued_to(string email)
    {
        AccessToken = TokenService.IssueAccessToken(AccessGrantFor(email));
        return Task.CompletedTask;
    }

    public Task Given_notes(params Note[] notes)
    {
        return Factory.SeedDataAsync(notes);
    }

    public async Task When_mcp_client_connects()
    {
        await using var mcpClient = await ConnectMcpClient();
        _connectedServer = mcpClient.ServerInfo;
    }

    public Task When_mcp_client_calls_get_food_logs(string from, string to)
    {
        return When_mcp_client_calls_listed_tool("get_food_logs", new Dictionary<string, object?>
        {
            ["from"] = from,
            ["to"] = to
        });
    }

    public async Task When_mcp_client_gets_nutrition_report_prompt(string period)
    {
        await using var mcpClient = await ConnectMcpClient();

        var prompts = await mcpClient.ListPromptsAsync();
        _listedPromptNames = prompts.Select(prompt => prompt.Name).ToList();

        _promptResult = await prompts.Single(prompt => prompt.Name == "nutrition_report")
            .GetAsync(new Dictionary<string, object?> { ["period"] = period });
    }

    public Task When_client_calls_mcp_with_access_token()
    {
        return CallMcp(AccessToken);
    }

    public Task Then_access_is_forbidden()
    {
        McpResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        return Task.CompletedTask;
    }

    public Task Then_mcp_client_is_connected()
    {
        _connectedServer.Name.Should().NotBeNullOrWhiteSpace();
        return Task.CompletedTask;
    }

    public Task Then_mcp_client_lists_tools(params string[] toolNames)
    {
        ListedToolNames.Should().BeEquivalentTo(toolNames);
        return Task.CompletedTask;
    }

    public Task Then_mcp_client_lists_prompts(params string[] promptNames)
    {
        _listedPromptNames.Should().BeEquivalentTo(promptNames);
        return Task.CompletedTask;
    }

    public Task Then_prompt_mentions(string text)
    {
        _promptResult.Messages.Select(message => message.Content).OfType<TextContentBlock>().Single().Text
            .Should().Contain(text);
        return Task.CompletedTask;
    }

    public Task Then_food_logs_contain(Note note)
    {
        ToolResult.IsError.Should().NotBe(true);

        using var foodLogs = JsonDocument.Parse(ToolResultText());
        var day = foodLogs.RootElement.GetProperty("days").EnumerateArray().Single();
        day.GetProperty("date").GetString().Should().Be(note.Date.ToString("yyyy-MM-dd"));

        var item = day.GetProperty("meals").EnumerateArray().Single().GetProperty("items").EnumerateArray().Single();
        item.GetProperty("product").GetProperty("name").GetString().Should().Be(note.Product!.Name);
        item.GetProperty("quantity").GetInt32().Should().Be(note.ProductQuantity);

        return Task.CompletedTask;
    }

    public Task Then_tool_call_is_error(string message)
    {
        ToolResult.IsError.Should().BeTrue();
        ToolResultText().Should().Contain(message);
        return Task.CompletedTask;
    }
}
