using FoodDiary.ComponentTests.Dsl;
using FoodDiary.ComponentTests.Infrastructure;

namespace FoodDiary.ComponentTests.Scenarios.Mcp;

public class McpServerTests(InfrastructureFixture infrastructure) : BaseTest<McpServerContext>(infrastructure)
{
    [Scenario]
    public Task The_client_with_access_token_can_connect()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_access_token_was_issued(),
            c => c.When_mcp_client_connects(),
            c => c.Then_mcp_client_is_connected());
    }

    [Scenario]
    public Task The_client_can_get_food_logs()
    {
        var note = Create.Note().WithDate("2026-09-01").WithProduct("Oatmeal", quantity: 60).Please();

        return CtxRunner.RunScenarioAsync(
            c => c.Given_notes(note),
            c => c.Given_access_token_was_issued(),
            c => c.When_mcp_client_calls_get_food_logs("2026-09-01", "2026-09-01"),
            c => c.Then_mcp_client_lists_tools("get_food_logs", "list_products"),
            c => c.Then_food_logs_contain(note));
    }

    [Scenario]
    public Task The_client_is_told_to_split_food_logs_range_wider_than_31_days()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_access_token_was_issued(),
            c => c.When_mcp_client_calls_get_food_logs("2026-09-01", "2026-10-02"),
            c => c.Then_tool_call_is_error("Requested 32 days; the maximum is 31. Split the range."));
    }

    [Scenario]
    public Task The_client_can_list_products()
    {
        var oatmeal = Create.Product("Oatmeal").Please();
        var apple = Create.Product("Apple").Please();

        return CtxRunner.RunScenarioAsync(
            c => c.Given_products(oatmeal, apple),
            c => c.Given_access_token_was_issued(),
            c => c.When_mcp_client_calls_list_products("oat"),
            c => c.Then_mcp_client_lists_tools("get_food_logs", "list_products"),
            c => c.Then_products_contain(oatmeal));
    }

    [Scenario]
    public Task The_client_can_get_nutrition_report_prompt()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_access_token_was_issued(),
            c => c.When_mcp_client_gets_nutrition_report_prompt("last 14 days"),
            c => c.Then_mcp_client_lists_prompts("nutrition_report"),
            c => c.Then_prompt_mentions("last 14 days"));
    }

    [Scenario]
    public Task The_client_with_access_token_of_user_no_longer_allowed_is_forbidden()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_access_token_was_issued_to("removed.user@gmail.com"),
            c => c.When_client_calls_mcp_with_access_token(),
            c => c.Then_access_is_forbidden());
    }
}
