using System;
using System.Collections.Generic;
using FoodDiary.Application.Enums;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;
using MediatR;

namespace FoodDiary.Application.Pages.Requests
{
    public class GetPagesRequest : IRequest<List<Page>>
    {
        public SortOrder SortOrder { get; set; } = SortOrder.Descending;

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public PagesLoadRequestType LoadType { get; set; } = PagesLoadRequestType.None;

        public GetPagesRequest()
        {
        }

        public GetPagesRequest(DateTime? startDate, DateTime? endDate)
        {
            StartDate = startDate;
            EndDate = endDate;
        }

        public GetPagesRequest(SortOrder sortOrder, DateTime? startDate, DateTime? endDate)
        {
            SortOrder = sortOrder;
            StartDate = startDate;
            EndDate = endDate;
        }

        public GetPagesRequest(SortOrder sortOrder, DateTime? startDate, DateTime? endDate, PagesLoadRequestType loadType)
        {
            SortOrder = sortOrder;
            StartDate = startDate;
            EndDate = endDate;
            LoadType = loadType;
        }
    }
}
