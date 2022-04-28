using System;

namespace FoodDiary.Application.Services.Export.GoogleDocs;

public class ExportGoogleDocsRequestDto
{
    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public string AccessToken { get; set; }
}