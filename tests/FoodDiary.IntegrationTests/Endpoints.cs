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

        public static string GetPages { get; } = PagesBaseUrl;
        public static string GetNotes { get; } = NotesBaseUrl;
        public static string GetProducts { get; } = ProductsBaseUrl;
        public static string GetProductsDropdown { get; } = $"{ProductsBaseUrl}/dropdown";

        public static string CreatePage { get; } = PagesBaseUrl;
        public static string CreateNote { get; } = NotesBaseUrl;
        public static string CreateProduct { get; } = ProductsBaseUrl;

        public static string EditProduct { get; } = ProductsBaseUrl;

        public static string DeleteNote { get; } = NotesBaseUrl;
        public static string DeleteProduct { get; } = ProductsBaseUrl;
    }
}
