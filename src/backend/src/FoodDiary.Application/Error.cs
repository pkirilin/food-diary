namespace FoodDiary.Application;

public abstract record Error(string Message, string Description)
{
    public record ValidationError(string Description) : Error("Validation Error", Description);
    public record InternalServerError(string Description) : Error("Internal Server Error", Description);
}