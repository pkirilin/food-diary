namespace FoodDiary.Application;

public abstract record Error(string Message, string Description)
{
    public record ValidationError(string Description) : Error("Validation Error", Description);
    public record InternalServerError(string Description) : Error("Internal Server Error", Description);
}

public abstract record Result<T>
{
    public record Success(T Data) : Result<T>;
    public record Failure(Error Error) : Result<T>;

    public static Result<T> ValidationError(string description) =>
        new Failure(new Error.ValidationError(description));
    
    public static Result<T> InternalServerError(string description) =>
        new Failure(new Error.InternalServerError(description));
}
