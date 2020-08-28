using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Products.Requests;
using FoodDiary.Domain.Repositories;
using MediatR;

namespace FoodDiary.Application.Products.Handlers
{
    class EditProductRequestHandler : IRequestHandler<EditProductRequest, int>
    {
        private readonly IProductRepository _productRepository;

        public EditProductRequestHandler(IProductRepository productRepository)
        {
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
        }

        public Task<int> Handle(EditProductRequest request, CancellationToken cancellationToken)
        {
            _productRepository.Update(request.Entity);
            return _productRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
