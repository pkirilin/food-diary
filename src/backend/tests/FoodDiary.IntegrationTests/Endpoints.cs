namespace FoodDiary.IntegrationTests
{
    /// <summary>
    /// Contains application endpoint constants for integration tests 
    /// </summary>
    internal static class Endpoints
    {
        private const string PagesBaseUrl = "api/v1/pages";
        private const string NotesBaseUrl = "api/v1/notes";
        private const string ProductsBaseUrl = "api/v1/products";
        private const string CategoriesBaseUrl = "api/v1/categories";

        public static string GetPages => PagesBaseUrl;
        public static string GetNotes => NotesBaseUrl;
        public static string GetProducts => ProductsBaseUrl;
        public static string GetCategories => CategoriesBaseUrl;
        public static string GetDateForNewPage => $"{PagesBaseUrl}/date";

        public static string CreatePage => PagesBaseUrl;
        public static string CreateNote => NotesBaseUrl;
        public static string CreateCategory => CategoriesBaseUrl;

        public static string EditPage => PagesBaseUrl;
        public static string EditNote => NotesBaseUrl;
        public static string EditCategory => CategoriesBaseUrl;

        public static string DeletePage => PagesBaseUrl;
        public static string DeletePages => $"{PagesBaseUrl}/batch";
        public static string DeleteNote => NotesBaseUrl;
        public static string DeleteProduct => ProductsBaseUrl;
        public static string DeleteCategory => CategoriesBaseUrl;
    }
}
