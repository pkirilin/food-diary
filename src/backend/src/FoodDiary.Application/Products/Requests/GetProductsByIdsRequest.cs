using System.Collections.Generic;
using FoodDiary.Application.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Products.Requests;

public class GetProductsByIdsRequest : GetEntitiesByIdsRequest<Product>
{
    public GetProductsByIdsRequest(IEnumerable<int> ids) : base(ids)
    {
    }
}