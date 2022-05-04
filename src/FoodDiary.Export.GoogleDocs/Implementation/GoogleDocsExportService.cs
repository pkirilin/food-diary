using FoodDiary.Domain.Enums;
using FoodDiary.Domain.Utils;

namespace FoodDiary.Export.GoogleDocs.Implementation;

internal class GoogleDocsExportService : IGoogleDocsExportService
{
    private readonly IGoogleDocsClient _docsClient;
    private readonly IGoogleDriveClient _driveClient;
    private readonly ICaloriesCalculator _caloriesCalculator;

    public GoogleDocsExportService(IGoogleDocsClient docsClient,
        IGoogleDriveClient driveClient,
        ICaloriesCalculator caloriesCalculator)
    {
        _docsClient = docsClient;
        _driveClient = driveClient;
        _caloriesCalculator = caloriesCalculator;
    }
    
    public async Task ExportAsync(GoogleDocsExportData exportData, CancellationToken cancellationToken)
    {
        var title = GenerateExportFileName(exportData.StartDate, exportData.EndDate);
        var exportDocument = await _docsClient.CreateDocumentAsync(title, exportData.AccessToken, cancellationToken);
        
        await _driveClient.SaveDocumentAsync(exportDocument, exportData.AccessToken, cancellationToken);
        
        foreach (var page in exportData.Pages)
        {
            var cells = new List<List<string>>
            {
                new() { "Прием пищи", "Продукт/блюдо", "Кол-во (г, мл)", "Ккал", "Общее\nкол-во\nкалорий" }
            };
            
            var mergedCells = new List<List<(int, int)>>();
            
            var groups = page.Notes.GroupBy(n => n.MealType)
                .OrderBy(g => g.Key)
                .Select(g => g.OrderBy(n => n.DisplayOrder).ToArray())
                .ToArray();

            var totalCalories = 0;

            foreach (var group in groups)
            {
                var totalCaloriesPerGroup = _caloriesCalculator.Calculate(group);
                
                foreach (var note in group)
                {
                    var calories = _caloriesCalculator.Calculate(note);

                    cells.Add(new List<string>
                    {
                        GetMealName(note.MealType),
                        note.Product.Name,
                        note.ProductQuantity.ToString(),
                        calories.ToString(),
                        totalCaloriesPerGroup.ToString()
                    });
                }

                totalCalories += totalCaloriesPerGroup;
            }
            
            cells.Add(new List<string>
            {
                "Всего за день:", "", "", "", totalCalories.ToString()
            });
            
            mergedCells.Add(new List<(int, int)>
            {
                (cells.Count - 1, 0),
                (cells.Count - 1, 1),
                (cells.Count - 1, 2),
                (cells.Count - 1, 3),
            });
            
            _docsClient.InsertH1Text(exportDocument, page.Date.ToString("dd.MM.yyyy"));
            
            _docsClient.InsertTable(exportDocument, new InsertTableOptions
            {
                Cells = cells,
                MergedCells = mergedCells
            });
        }

        await _docsClient.BatchUpdateDocumentAsync(exportDocument.DocumentId, exportData.AccessToken, cancellationToken);
    }

    private static string GenerateExportFileName(DateTime startDate, DateTime endDate)
    {
        return $"FoodDiary_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}";
    }

    private static string GetMealName(MealType mealType)
    {
        return mealType switch
        {
            MealType.Breakfast => "Завтрак",
            MealType.SecondBreakfast => "Ланч",
            MealType.Lunch => "Обед",
            MealType.AfternoonSnack => "Полдник",
            MealType.Dinner => "Ужин",
            _ => throw new ArgumentOutOfRangeException(nameof(mealType), mealType, null)
        };
    }
}