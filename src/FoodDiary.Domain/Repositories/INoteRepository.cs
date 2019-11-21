using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Domain.Repositories
{
    public interface INoteRepository
    {
        IQueryable<Note> GetQuery();

        IQueryable<Note> GetQueryWithoutTracking();

        Task<List<Note>> GetListFromQueryAsync(IQueryable<Note> notesQuery, CancellationToken cancellationToken);

        Task<Note> GetByIdAsync(int id, CancellationToken cancellationToken);

        Task<IEnumerable<Note>> GetByPageIdAsync(int pageId, CancellationToken cancellationToken);

        Task<Note> CreateAsync(Note note, CancellationToken cancellationToken);

        Task<Note> UpdateAsync(Note note, CancellationToken cancellationToken);

        Task UpdateRangeAsync(IEnumerable<Note> notes, CancellationToken cancellationToken);

        Task<Note> DeleteAsync(Note note, CancellationToken cancellationToken);

        Task DeleteRangeAsync(IEnumerable<Note> notes, CancellationToken cancellationToken);
    }
}
