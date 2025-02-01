using FoodDiary.ComponentTests.Dsl;
using FoodDiary.Domain.Entities;

namespace FoodDiary.ComponentTests.Scenarios.Products;

public class ProductsCatalog
{
    private readonly Dictionary<string, Product> _products = new();
    
    public Product TryGetOrAdd(string name, out bool isNew)
    {
        if (_products.TryGetValue(name, out var existingProduct))
        {
            isNew = false;
            return existingProduct;
        }

        var newProduct = Create.Product(name).Please();
        _products.Add(name, newProduct);
        isNew = true;
        return newProduct;
    }
}