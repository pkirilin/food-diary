using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Categories.Requests;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using MediatR;

namespace FoodDiary.Application.Categories.Handlers;

class GetCategoryByIdRequestHandler : IRequestHandler<GetCategoryByIdRequest, Category>
{
    private readonly ICategoryRepository _categoryRepository;

    public GetCategoryByIdRequestHandler(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository ?? throw new ArgumentNullException(nameof(categoryRepository));
    }

    public Task<Category> Handle(GetCategoryByIdRequest request, CancellationToken cancellationToken)
    {
        return _categoryRepository.GetByIdAsync(request.Id, cancellationToken);
    }
}