using System.Net;
using System.Net.Http.Json;
using FoodDiary.ComponentTests.Infrastructure;
using JetBrains.Annotations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.ComponentTests.Scenarios.ErrorHandling;

[UsedImplicitly]
public class ErrorHandlingContext(FoodDiaryWebApplicationFactory factory) : BaseContext(factory)
{
    private HttpStatusCode _statusCode;

    public Task Given_application_is_broken_because_of_an_unhandled_exception(Exception exception)
    {
        Factory = Factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureTestServices(services =>
            {
                services.Configure<MvcOptions>(options =>
                {
                    options.Filters.Add(new FakeExceptionActionFilter(exception));
                });
            });
        });
        
        return Task.CompletedTask;
    }
    
    public async Task When_user_is_trying_to_access_resource(string resource)
    {
        Response = await ApiClient.GetAsync(resource);
        _statusCode = Response.StatusCode;
    }
    
    public Task Then_response_has_status(HttpStatusCode status)
    {
        _statusCode.Should().Be(status);
        return Task.CompletedTask;
    }
    
    public async Task Then_response_is_problem_details()
    {
        var problemDetails = await Response!.Content.ReadFromJsonAsync<ProblemDetails>();
        problemDetails!.Status.Should().Be((int)_statusCode);
        problemDetails.Title.Should().NotBeNullOrWhiteSpace();
        problemDetails.Detail.Should().NotBeNullOrWhiteSpace();
    }
}