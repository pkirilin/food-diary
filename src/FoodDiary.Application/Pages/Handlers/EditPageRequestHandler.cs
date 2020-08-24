using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Pages.Requests;
using FoodDiary.Domain.Repositories;
using MediatR;

namespace FoodDiary.Application.Pages.Handlers
{
    public class EditPageRequestHandler : IRequestHandler<EditPageRequest, int>
    {
        private readonly IPageRepository _pageRepository;

        public EditPageRequestHandler(IPageRepository pageRepository)
        {
            _pageRepository = pageRepository ?? throw new ArgumentNullException(nameof(pageRepository));
        }

        public Task<int> Handle(EditPageRequest request, CancellationToken cancellationToken)
        {
            _pageRepository.Update(request.Entity);
            return _pageRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
