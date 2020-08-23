using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Categories.Requests;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using MediatR;

namespace FoodDiary.Application.Categories.Handlers
{
    public class CreateCategoryRequestHandler : IRequestHandler<CreateCategoryRequest, Category>
    {
        private readonly ICategoryRepository _categoryRepository;

        public CreateCategoryRequestHandler(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository ?? throw new ArgumentNullException(nameof(categoryRepository));
        }

        public async Task<Category> Handle(CreateCategoryRequest request, CancellationToken cancellationToken)
        {
            var createdCategory = _categoryRepository.Create(request.Entity);
            await _categoryRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
            return createdCategory;
        }
    }
}
