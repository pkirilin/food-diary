using System;
using System.Collections.Generic;
using FoodDiary.Domain.Entities;
using MediatR;

namespace FoodDiary.Application.Pages.Requests
{
    public class GetPagesByExactDateRequest : IRequest<List<Page>>
    {
        public DateTime Date { get; set; }

        public GetPagesByExactDateRequest(DateTime date)
        {
            Date = date;
        }
    }
}
