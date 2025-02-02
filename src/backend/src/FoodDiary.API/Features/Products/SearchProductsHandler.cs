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
                // Turns inner join to left join: we need all products even if they have no notes
                g => g.Notes.DefaultIfEmpty(),
                (g, note) => new { g.Product, Note = note })
            .GroupBy(g => new { g.Product.Id, g.Product.Name, g.Product.DefaultQuantity })
            .Select(g => new
            {
                g.Key.Id,
                g.Key.Name,
                g.Key.DefaultQuantity,
                LastUsedOn = g.Max(x => x.Note == null ? default : x.Note.Date)
            })
            .OrderByDescending(p => p.LastUsedOn)
            .ThenBy(p => p.Name)
            .Select(p => new SearchProductsResult.Product(p.Id, p.Name, p.DefaultQuantity))
            .ToListAsync(cancellationToken);

        return new SearchProductsResult(products);
    }
}