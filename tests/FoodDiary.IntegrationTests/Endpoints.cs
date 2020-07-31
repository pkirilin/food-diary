namespace FoodDiary.IntegrationTests
{
    /// <summary>
    /// Contains application endpoint constants for integration tests 
    /// </summary>
    static class Endpoints
    {
        private const string PagesBaseUrl = "v1/pages";
        private const string NotesBaseUrl = "v1/notes";

        public const string GetPages = PagesBaseUrl;
        public const string GetNotes = NotesBaseUrl;

        public const string CreatePage = PagesBaseUrl;
        public const string CreateNote = NotesBaseUrl;

        public const string DeleteNote = NotesBaseUrl;
    }
}
