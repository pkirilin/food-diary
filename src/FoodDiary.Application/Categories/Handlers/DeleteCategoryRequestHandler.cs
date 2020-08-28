using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Categories.Requests;
using FoodDiary.Domain.Repositories;
using MediatR;

namespace FoodDiary.Application.Categories.Handlers
{
    class DeleteCategoryRequestHandler : IRequestHandler<DeleteCategoryRequest, int>
    {
        private readonly ICategoryRepository _categoryRepository;

        public DeleteCategoryRequestHandler(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository ?? throw new ArgumentNullException(nameof(categoryRepository));
        }

        public Task<int> Handle(DeleteCategoryRequest request, CancellationToken cancellationToken)
        {
            _categoryRepository.Delete(request.Entity);
            return _categoryRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
