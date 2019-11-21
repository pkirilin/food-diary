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

        public async Task<Note> CreateAsync(Note note, CancellationToken cancellationToken)
        {
            var entry = _context.Add(note);
            await _context.SaveChangesAsync(cancellationToken);
            return entry.Entity;
        }

        public async Task<Note> UpdateAsync(Note note, CancellationToken cancellationToken)
        {
            var entry = _context.Update(note);
            await _context.SaveChangesAsync(cancellationToken);
            return entry.Entity;
        }

        public async Task UpdateRangeAsync(IEnumerable<Note> notes, CancellationToken cancellationToken)
        {
            _context.UpdateRange(notes);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<Note> DeleteAsync(Note note, CancellationToken cancellationToken)
        {
            var entry = _context.Remove(note);
            await _context.SaveChangesAsync(cancellationToken);
            return entry.Entity;
        }

        public async Task DeleteRangeAsync(IEnumerable<Note> notes, CancellationToken cancellationToken)
        {
            _context.RemoveRange(notes);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
