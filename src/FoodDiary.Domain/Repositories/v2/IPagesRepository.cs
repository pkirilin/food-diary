using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Domain.Repositories.v2;

public interface IPagesRepository
{
    Task<Page[]> GetAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken);
}