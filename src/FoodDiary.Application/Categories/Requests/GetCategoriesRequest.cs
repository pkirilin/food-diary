using System.Collections.Generic;
using FoodDiary.Domain.Entities;
using MediatR;

namespace FoodDiary.Application.Categories.Requests
{
    public class GetCategoriesRequest : IRequest<List<Category>>
    {
        public string CategoryNameFilter { get; set; }

        public bool LoadProducts { get; set; } = false;

        public GetCategoriesRequest()
        {
        }

        public GetCategoriesRequest(string categoryNameFilter)
        {
            CategoryNameFilter = categoryNameFilter;
        }

        public GetCategoriesRequest(bool loadProducts)
        {
            LoadProducts = loadProducts;
        }
    }
}
