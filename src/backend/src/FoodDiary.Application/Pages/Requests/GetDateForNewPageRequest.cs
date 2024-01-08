using System;
using MediatR;

namespace FoodDiary.Application.Pages.Requests;

public class GetDateForNewPageRequest : IRequest<DateTime>
{
}