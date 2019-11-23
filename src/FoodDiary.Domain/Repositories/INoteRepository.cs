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

        Task<int> GetMaxDisplayOrderFromQueryAsync(IQueryable<Note> notesQuery, CancellationToken cancellationToken);

        Task<Note> GetByIdAsync(int id, CancellationToken cancellationToken);

        Task<IEnumerable<Note>> GetByPageIdAsync(int pageId, CancellationToken cancellationToken);

        Note Create(Note note);

        Note Update(Note note);

        Note Delete(Note note);

        void UpdateRange(IEnumerable<Note> notes);

        void DeleteRange(IEnumerable<Note> notes);

        Task SaveChangesAsync(CancellationToken cancellationToken);
    }
}
