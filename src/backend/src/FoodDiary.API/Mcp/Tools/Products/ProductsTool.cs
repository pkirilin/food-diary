using System.ComponentModel;
using FoodDiary.Application.Products.Get;
using ModelContextProtocol;
using ModelContextProtocol.Server;

namespace FoodDiary.API.Mcp.Tools.Products;

[McpServerToolType]
public class ProductsTool(GetProductsQueryHandler getProductsQueryHandler)
{
    private const int MaxPageSize = 100;

    private const string ListProductsToolDescription =
        """
        Products in the personal catalogue, ordered by name, one page at a time.

        Nutrition under `per100g` is per 100 g of product: `calories` in kilocalories, the rest in grams (salt is sodium chloride). `defaultQuantity` is the usual portion in grams, not a number of servings.

        A `null` nutrition value means the product has no value recorded for it: unknown, not zero.

        `totalCount` is the number of products matching `productName` across all pages; request the next page while `pageNumber` × `pageSize` is below it. A page holds at most 100 products.
        """;

    [McpServerTool(Name = "list_products", ReadOnly = true, OpenWorld = false)]
    [Description(ListProductsToolDescription)]
    public async Task<ListProductsToolResponse> ListProducts(
        [Description("Page to return, starting at 1.")] int pageNumber,
        [Description("Products per page, from 1 to 100.")] int pageSize,
        [Description("Case-insensitive part of the product name. Omit to list every product.")] string? productName = null,
        CancellationToken cancellationToken = default)
    {
        if (pageNumber < 1)
        {
            throw new McpException($"Requested pageNumber {pageNumber}; pages start at 1.");
        }

        if (pageSize < 1)
        {
            throw new McpException($"Requested pageSize {pageSize}; the minimum is 1.");
        }

        if (pageSize > MaxPageSize)
        {
            throw new McpException($"Requested pageSize {pageSize}; the maximum is {MaxPageSize}. Request the next page instead.");
        }

        var result = await getProductsQueryHandler.Handle(
            new GetProductsQuery(pageNumber, pageSize, productName, CategoryId: null),
            cancellationToken);

        return result.ToListProductsToolResponse(pageNumber, pageSize);
    }
}
