using System;
using System.Collections.Generic;
using FoodDiary.Application.Enums;
using FoodDiary.Domain.Entities;
using MediatR;

namespace FoodDiary.Application.Pages.Requests
{
    public class GetPagesForExportRequest : IRequest<List<Page>>
    {
        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public PagesLoadRequestType LoadType { get; set; }

        public GetPagesForExportRequest(DateTime? startDate, DateTime? endDate, PagesLoadRequestType loadType)
        {
            StartDate = startDate;
            EndDate = endDate;
            LoadType = loadType;
        }
    }
}
