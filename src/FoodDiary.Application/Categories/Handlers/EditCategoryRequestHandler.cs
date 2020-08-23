using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Categories.Requests;
using FoodDiary.Domain.Repositories;
using MediatR;

namespace FoodDiary.Application.Categories.Handlers
{
    public class EditCategoryRequestHandler : IRequestHandler<EditCategoryRequest, int>
    {
        private readonly ICategoryRepository _categoryRepository;

        public EditCategoryRequestHandler(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository ?? throw new ArgumentNullException(nameof(categoryRepository));
        }

        public Task<int> Handle(EditCategoryRequest request, CancellationToken cancellationToken)
        {
            _categoryRepository.Update(request.Entity);
            return _categoryRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
