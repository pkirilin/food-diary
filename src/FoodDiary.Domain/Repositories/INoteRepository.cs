using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Domain.Repositories
{
    public interface INoteRepository : IRepository<Note>
    {
        IQueryable<Note> GetQuery();

        IQueryable<Note> GetQueryWithoutTracking();

        Task<List<Note>> GetListFromQueryAsync(IQueryable<Note> notesQuery, CancellationToken cancellationToken);

        Task<int> GetMaxDisplayOrderFromQueryAsync(IQueryable<Note> notesQuery, CancellationToken cancellationToken);

        Task<Note> GetByIdAsync(int id, CancellationToken cancellationToken);

        Note Create(Note note);

        void Update(Note note);

        void Delete(Note note);

        void UpdateRange(IEnumerable<Note> notes);

        void DeleteRange(IEnumerable<Note> notes);

        IQueryable<Note> LoadProduct(IQueryable<Note> query);
    }
}
