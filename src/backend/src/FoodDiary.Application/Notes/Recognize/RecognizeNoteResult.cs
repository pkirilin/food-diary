namespace FoodDiary.Application.Notes.Recognize;

public abstract record RecognizeNoteResult
{
    public sealed record Success(RecognizeNoteResponse Response) : RecognizeNoteResult;

    public sealed record Failure(Error Error) : RecognizeNoteResult;

    public static Failure NoImagesProvided() =>
        new(new Error.ValidationError("No images provided"));

    public static Failure NotAProductImage() =>
        new(new Error.ValidationError("Uploaded image(s) do not contain a recognizable product"));

    public static Failure ModelResponseWasInvalid() =>
        new(new Error.InternalServerError("Model response was invalid"));
}