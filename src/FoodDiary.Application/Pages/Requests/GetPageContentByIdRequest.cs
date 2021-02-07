using FoodDiary.Application.Models;
using MediatR;

namespace FoodDiary.Application.Pages.Requests
{
    public class GetPageContentByIdRequest : IRequest<PageContent>
    {
        public int PageId { get; }

        public GetPageContentByIdRequest(int pageId)
        {
            PageId = pageId;
        }
    }
}
