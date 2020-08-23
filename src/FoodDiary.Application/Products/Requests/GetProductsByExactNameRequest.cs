using System.Collections.Generic;
using FoodDiary.Domain.Entities;
using MediatR;

namespace FoodDiary.Application.Products.Requests
{
    public class GetProductsByExactNameRequest : IRequest<List<Product>>
    {
        public string Name { get; set; }

        public GetProductsByExactNameRequest(string name)
        {
            Name = name;
        }
    }
}
