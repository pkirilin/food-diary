namespace FoodDiary.Application.Products.SuggestNutrition;

public abstract record SuggestNutritionResult
{
    public sealed record Success(SuggestNutritionResponse Response) : SuggestNutritionResult;

    public sealed record Failure(Error Error) : SuggestNutritionResult;

    public static Failure NameIsRequired() =>
        new(new Error.ValidationError("Product name is required"));

    public static Failure ModelResponseWasInvalid() =>
        new(new Error.InternalServerError("Model response was invalid"));
}
