using System.Linq;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Domain.Repositories;

public interface IProductRepository : IRepository<Product>
{
    IQueryable<Product> LoadCategory(IQueryable<Product> query);
}