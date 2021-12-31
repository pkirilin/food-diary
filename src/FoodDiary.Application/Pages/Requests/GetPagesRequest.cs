using System;
using FoodDiary.Application.Models;
using FoodDiary.Domain.Enums;
using MediatR;

namespace FoodDiary.Application.Pages.Requests
{
    public class GetPagesRequest : IRequest<PagesSearchResult>
    {
        public SortOrder SortOrder { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public int PageNumber { get; set; }

        public int PageSize { get; set; }
        
        public GetPagesRequest(SortOrder sortOrder, DateTime? startDate, DateTime? endDate, int pageNumber, int pageSize)
        {
            SortOrder = sortOrder;
            StartDate = startDate;
            EndDate = endDate;
            PageNumber = pageNumber;
            PageSize = pageSize;
        }
    }
}
