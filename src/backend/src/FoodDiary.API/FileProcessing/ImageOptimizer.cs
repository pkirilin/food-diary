using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ImageMagick;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace FoodDiary.API.FileProcessing;

public interface IImageOptimizer
{
    Task<byte[][]> ConvertToCompactByteArrayList(
        IEnumerable<IFormFile> files,
        CancellationToken cancellationToken);
}

public class ImageOptimizer(ILogger<ImageOptimizer> logger) : IImageOptimizer
{
    private const int CompactSize = 512;
    
    public async Task<byte[][]> ConvertToCompactByteArrayList(
        IEnumerable<IFormFile> files,
        CancellationToken cancellationToken)
    {
        try
        {
            var tasks = files.Select(file => ConvertToCompactByteArray(file, cancellationToken));
            return await Task.WhenAll(tasks);
        }
        catch (AggregateException ae)
        {
            foreach (var ex in ae.InnerExceptions)
            {
                logger.LogError(ex, ex.Message);
            }
            
            return [];
        }
    }
    
    private static async Task<byte[]> ConvertToCompactByteArray(
        IFormFile file,
        CancellationToken cancellationToken)
    {
        await using var stream = file.OpenReadStream();
        using var image = new MagickImage();
        await image.ReadAsync(stream, cancellationToken);
        image.Format = MagickFormat.Jpeg;

        if (image.Width > CompactSize)
        {
            image.Resize(CompactSize, 0);
        }

        return image.ToByteArray();

        // return $"data:image/jpeg;base64,{image.ToBase64()}";
    }
}