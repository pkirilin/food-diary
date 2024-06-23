using Microsoft.AspNetCore.Mvc.Filters;

namespace FoodDiary.ComponentTests.Scenarios.ErrorHandling;

public class FakeExceptionActionFilter(Exception exception) : IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context)
    {
        throw exception;
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
    }
}