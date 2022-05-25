namespace FoodDiary.IntegrationTests
{
    /// <summary>
    /// Contains application endpoint constants for integration tests 
    /// </summary>
    static class Endpoints
    {
        private const string PagesBaseUrl = "v1/pages";
        private const string NotesBaseUrl = "v1/notes";
        private const string ProductsBaseUrl = "v1/products";
        private const string CategoriesBaseUrl = "v1/categories";
        private const string ImportsBaseUrl = "v1/imports";

        public static string GetPages { get; } = PagesBaseUrl;
        public static string GetNotes { get; } = NotesBaseUrl;
        public static string GetProducts { get; } = ProductsBaseUrl;
        public static string GetCategories { get; } = CategoriesBaseUrl;
        public static string GetDateForNewPage { get; } = $"{PagesBaseUrl}/date";

        public static string CreatePage { get; } = PagesBaseUrl;
        public static string CreateNote { get; } = NotesBaseUrl;
        public static string CreateProduct { get; } = ProductsBaseUrl;
        public static string CreateCategory { get; } = CategoriesBaseUrl;

        public static string EditPage { get; } = PagesBaseUrl;
        public static string EditNote { get; } = NotesBaseUrl;
        public static string EditProduct { get; } = ProductsBaseUrl;
        public static string EditCategory { get; } = CategoriesBaseUrl;

        public static string DeletePage { get; } = PagesBaseUrl;
        public static string DeletePages { get; } = $"{PagesBaseUrl}/batch";
        public static string DeleteNote { get; } = NotesBaseUrl;
        public static string DeleteProduct { get; } = ProductsBaseUrl;
        public static string DeleteCategory { get; } = CategoriesBaseUrl;

        public static string ImportPagesJson { get; } = $"{ImportsBaseUrl}/json";
    }
}
