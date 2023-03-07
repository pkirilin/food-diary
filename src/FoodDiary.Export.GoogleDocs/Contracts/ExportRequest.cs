using FoodDiary.Contracts.Export;

namespace FoodDiary.Export.GoogleDocs.Contracts;

public record ExportRequest(string? AccessToken, ExportFileDto File);