using System;
using System.IO;
using Microsoft.AspNetCore.Http;

namespace FoodDiary.API.Extensions;

public static class FormFileExtensions
{
    public static string ToBase64String(this IFormFile file)
    {
        using var stream = file.OpenReadStream();
        using var memoryStream = new MemoryStream();
        stream.CopyTo(memoryStream);
        return $"data:{GetContentType(file)};base64,{Convert.ToBase64String(memoryStream.ToArray())}";
    }
    
    private static string GetContentType(this IFormFile file) =>
        string.IsNullOrWhiteSpace(file.ContentType)
            ? "application/octet-stream"
            : file.ContentType;
}