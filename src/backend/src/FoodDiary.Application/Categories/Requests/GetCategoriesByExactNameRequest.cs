using System.Collections.Generic;
using FoodDiary.Domain.Entities;
using MediatR;

namespace FoodDiary.Application.Categories.Requests;

public class GetCategoriesByExactNameRequest : IRequest<List<Category>>
{
    public string Name { get; set; }

    public GetCategoriesByExactNameRequest(string name)
    {
        Name = name;
    }
}