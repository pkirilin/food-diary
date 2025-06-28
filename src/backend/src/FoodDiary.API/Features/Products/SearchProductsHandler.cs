using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.API.Features.Products;

public record SearchProductsResult(IReadOnlyCollection<Product> Products);

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
            .GroupBy(g => g.Product)
            .Select(g => new
            {
                Product = g.Key,
                LastUsedOn = g.Max(x => x.Note == null ? default : x.Note.Date)
            })
            .OrderByDescending(p => p.LastUsedOn)
            .ThenBy(g => g.Product.Name)
            .Select(g => g.Product)
            .ToListAsync(cancellationToken);

        return new SearchProductsResult(products);
    }
}