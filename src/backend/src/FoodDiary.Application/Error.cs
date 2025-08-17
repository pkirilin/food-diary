namespace FoodDiary.Application;

public abstract record Error(string Message, string Description)
{
    public sealed record ValidationError(string Description) : Error("Validation Error", Description);

    public sealed record InternalServerError(string Description) : Error("Internal Server Error", Description);
}