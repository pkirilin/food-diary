namespace FoodDiary.PdfGenerator
{
    /// <summary>
    /// Format settings for PDF generator
    /// </summary>
    static class PagesPdfGeneratorOptions
    {
        public const decimal PageTopMarginCentimeters = 1;
        public const decimal PageBottomMarginCentimeters = 1;
        public const decimal PageLeftMarginCentimeters = 1;
        public const decimal PageRightMarginCentimeters = 1;

        public const int PageDateFontSize = 20;
        public const int PageDateSpaceAfter = 10;

        public const int NotesTableFontSize = 14;
        public const double NotesTableBorderWidthMillimeters = 1;
        public const decimal NotesTableRowHeightCentimeters = 1;

        public const decimal MealNameColumnWidthCentimeters = 5;
        public const decimal ProductNameColumnWidthCentimeters = 11;
        public const decimal ProductQuantityColumnWidthCentimeters = 4;
        public const decimal CaloriesColumnWidthCentimeters = 3;
        public const decimal TotalCaloriesColumnWidthCentimeters = 5;

        public const int MealNameColumnIndex = 0;
        public const int ProductNameColumnIndex = 1;
        public const int ProductQuantityColumnIndex = 2;
        public const int CaloriesCountColumnIndex = 3;
        public const int TotalCaloriesCountColumnIndex = 4;
    }
}
