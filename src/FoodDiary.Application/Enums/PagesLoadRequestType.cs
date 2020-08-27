namespace FoodDiary.Application.Enums
{
    /// <summary>
    /// Describes which entities related to pages are nessesary to be loaded in pages request
    /// </summary>
    public enum PagesLoadRequestType : byte
    {
        None = 0,
        OnlyNotesWithProducts = 1,
        All = 2
    }
}
