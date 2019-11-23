using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Infrastructure.Repositories
{
    public class NoteRepository : INoteRepository
    {
        private readonly FoodDiaryContext _context;

        public NoteRepository(FoodDiaryContext context)
        {
            _context = context;
        }

        public IQueryable<Note> GetQuery()
        {
            return _context.Notes.AsQueryable();
        }

        public IQueryable<Note> GetQueryWithoutTracking()
        {
            return GetQuery().AsNoTracking();
        }

        public async Task<List<Note>> GetListFromQueryAsync(IQueryable<Note> notesQuery, CancellationToken cancellationToken)
        {
            return await notesQuery.ToListAsync(cancellationToken);
        }

        public async Task<int> GetMaxDisplayOrderFromQueryAsync(IQueryable<Note> notesQuery, CancellationToken cancellationToken)
        {
            if (await notesQuery.AnyAsync())
                return await notesQuery.MaxAsync(n => n.DisplayOrder, cancellationToken);
            return -1;
        }

        public async Task<Note> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await _context.Notes.FindAsync(new object[] { id }, cancellationToken);
        }

        public async Task<IEnumerable<Note>> GetByPageIdAsync(int pageId, CancellationToken cancellationToken)
        {
            return await _context.Notes.Where(n => n.PageId == pageId)
                .Include(n => n.Page)
                .Include(n => n.Product)
                .OrderBy(n => n.DisplayOrder)
                .ToListAsync(cancellationToken);
        }

        public Note Create(Note note)
        {
            var entry = _context.Add(note);
            return entry.Entity;
        }

        public Note Update(Note note)
        {
            var entry = _context.Update(note);
            return entry.Entity;
        }

        public Note Delete(Note note)
        {
            var entry = _context.Remove(note);
            return entry.Entity;
        }

        public void UpdateRange(IEnumerable<Note> notes)
        {
            _context.UpdateRange(notes);
        }

        public void DeleteRange(IEnumerable<Note> notes)
        {
            _context.RemoveRange(notes);
        }

        public async Task SaveChangesAsync(CancellationToken cancellationToken)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
