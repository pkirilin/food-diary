using System.Net;
using FoodDiary.ComponentTests.Infrastructure;

namespace FoodDiary.ComponentTests.Scenarios.ErrorHandling;

public class ErrorHandlingTests(FoodDiaryWebApplicationFactory factory, InfrastructureFixture infrastructure) :
    ScenarioBase<ErrorHandlingContext>(factory, infrastructure)
{
    protected override ErrorHandlingContext CreateContext(
        FoodDiaryWebApplicationFactory factory,
        InfrastructureFixture infrastructure) => new(factory, infrastructure);

    [Scenario]
    public Task I_receive_unhandled_errors_in_problem_details_format()
    {
        var exception = new Exception("some error");
        
        return Run(
            c => c.Given_application_is_broken_because_of_an_unhandled_exception(exception),
            c => c.When_user_is_trying_to_access_resource("/api/v1/auth/status"),
            c => c.Then_response_has_status(HttpStatusCode.InternalServerError),
            c => c.Then_response_is_problem_details());
    }
}