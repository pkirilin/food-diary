using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ImageMagick;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace FoodDiary.API.FileProcessing;

public interface IFileOptimizer
{
    Task<string[]> ConvertToCompressedAndResizedBase64(
        IEnumerable<IFormFile> files,
        CancellationToken cancellationToken);
}

public class FileOptimizer(ILogger<FileOptimizer> logger) : IFileOptimizer
{
    private static readonly ImageOptimizer ImageOptimizer = new()
    {
        IgnoreUnsupportedFormats = true
    };
    
    private const int Size = 512;
    
    public Task<string[]> ConvertToCompressedAndResizedBase64(
        IEnumerable<IFormFile> files,
        CancellationToken cancellationToken)
    {
        try
        {
            var tasks = files.Select(file => ConvertToCompressedAndResizedBase64String(file, cancellationToken));
            return Task.WhenAll(tasks);
        }
        catch (AggregateException ae)
        {
            foreach (var ex in ae.InnerExceptions)
            {
                logger.LogError(ex, ex.Message);
            }
            
            return Task.FromResult(Array.Empty<string>());
        }
    }
    
    private static async Task<string> ConvertToCompressedAndResizedBase64String(
        IFormFile file,
        CancellationToken cancellationToken)
    {
        using var stream = new MemoryStream();
        await file.CopyToAsync(stream, cancellationToken);
        stream.Position = 0;
        ImageOptimizer.Compress(stream);
        
        using var image = new MagickImage();
        await image.ReadAsync(stream, cancellationToken);
        image.Resize(Size, 0);
        
        return $"data:{GetContentType(file)};base64,{image.ToBase64()}";
    }
    
    private static string GetContentType(IFormFile file) =>
        string.IsNullOrWhiteSpace(file.ContentType)
            ? "application/octet-stream"
            : file.ContentType;
}