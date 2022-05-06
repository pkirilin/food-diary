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
        var i = 0;
        
        foreach (var page in exportData.Pages)
        {
            var cells = new List<List<TableCell>>
            {
                GetTableHeaderCells()
            };

            var mergeCellsInfo = new List<MergeTableCellsData>();
            
            var groups = page.Notes.GroupBy(n => n.MealType)
                .OrderBy(g => g.Key)
                .Select(g => g.OrderBy(n => n.DisplayOrder).ToArray())
                .ToArray();

            var totalCalories = 0;

            foreach (var group in groups)
            {
                var totalCaloriesPerGroup = _caloriesCalculator.Calculate(group);
                var noteIndex = 0;

                foreach (var note in group)
                {
                    var calories = _caloriesCalculator.Calculate(note);
                    
                    cells.Add(new List<TableCell>
                    {
                        new() { Text = noteIndex == 0 ? GetMealName(note.MealType) : "" },
                        new() { Text = note.Product.Name },
                        new() { Text = note.ProductQuantity.ToString() },
                        new() { Text = calories.ToString() },
                        new() { Text = noteIndex == 0 ? totalCaloriesPerGroup.ToString() : "" },
                    });

                    noteIndex++;
                }
                
                if (group.Any())
                {
                    var groupStartRowIndex = cells.Count - group.Length;
                    
                    mergeCellsInfo.Add(new MergeTableCellsData
                    {
                        RowIndex = groupStartRowIndex,
                        ColumnIndex = 0,
                        RowSpan = group.Length,
                        ColumnSpan = 1
                    });
                
                    mergeCellsInfo.Add(new MergeTableCellsData
                    {
                        RowIndex = groupStartRowIndex,
                        ColumnIndex = 4,
                        RowSpan = group.Length,
                        ColumnSpan = 1
                    });
                }

                totalCalories += totalCaloriesPerGroup;
            }
            
            cells.Add(GetTotalCaloriesCells(totalCalories));

            mergeCellsInfo.Add(new MergeTableCellsData
            {
                RowIndex = cells.Count - 1,
                ColumnIndex = 0,
                RowSpan = 1,
                ColumnSpan = 4
            });
            
            _docsClient.InsertH1Text(exportDocument, page.Date.ToString("dd.MM.yyyy"));

            _docsClient.InsertTable(exportDocument, new InsertTableOptions
            {
                Cells = cells,
                MergeCellsInfo = mergeCellsInfo,
                ColumnWidths = GetTableColumnWidths()
            });

            if (i < exportData.Pages.Length - 1)
            {
                _docsClient.InsertPageBreak(exportDocument);
            }

            i++;
        }

        await _docsClient.BatchUpdateDocumentAsync(exportDocument.DocumentId, exportData.AccessToken, cancellationToken);
        await _driveClient.SaveDocumentAsync(exportDocument, exportData.AccessToken, cancellationToken);
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

    private static List<TableCell> GetTableHeaderCells()
    {
        var texts = new[] { "Прием пищи", "Продукт/блюдо", "Кол-во (г, мл)", "Ккал", "Общее\nкол-во\nкалорий" };
        
        return texts.Select(text => new TableCell
        {
            Text = text,
            IsBold = true,
            IsItalic = true
        }).ToList();
    }

    private static List<TableCell> GetTotalCaloriesCells(int totalCalories)
    {
        var texts = new[] { "Всего за день:", "", "", "", totalCalories.ToString() };

        return texts.Select(text => new TableCell
        {
            Text = text,
            IsBold = true,
            IsItalic = true
        }).ToList();
    }

    private static List<double> GetTableColumnWidths()
    {
        return new List<double> { 84.75, 165.75, 85.5, 51, 63.75 };
    }
}