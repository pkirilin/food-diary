using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.API.Features.Products.Contracts;
using FoodDiary.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.API.Features.Products;

public class SearchProductsHandler(FoodDiaryContext context)
{
    public async Task<SearchProductsResult> Handle(CancellationToken cancellationToken)
    {
        var products = await context.Products
            .GroupJoin(context.Notes,
                p => p.Id,
                n => n.ProductId,
                (p, notes) => new { Product = p, Notes = notes })
            .SelectMany(
                g => g.Notes,
                (g, note) => new { g.Product, Note = note })
            .GroupBy(g => new { g.Note.ProductId, g.Product.Name, g.Product.DefaultQuantity })
            .Select(g => new
            {
                g.Key.ProductId,
                g.Key.Name,
                g.Key.DefaultQuantity,
                LastUsedOn = g.Max(x => x.Note.Date)
            })
            .OrderByDescending(x => x.LastUsedOn)
            .ThenBy(x => x.Name)
            .Select(g => new SearchProductsResult.Product(g.ProductId, g.Name, g.DefaultQuantity))
            .ToListAsync(cancellationToken);

        return new SearchProductsResult(products);
    }
}