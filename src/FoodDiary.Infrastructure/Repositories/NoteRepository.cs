using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Infrastructure.Repositories
{
    public class NoteRepository : INoteRepository
    {
        private readonly FoodDiaryContext _context;

        public IUnitOfWork UnitOfWork => _context;

        public NoteRepository(FoodDiaryContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public IQueryable<Note> GetQuery()
        {
            return _context.Notes.AsQueryable();
        }

        public IQueryable<Note> GetQueryWithoutTracking()
        {
            return GetQuery().AsNoTracking();
        }

        public Task<List<Note>> GetListFromQueryAsync(IQueryable<Note> notesQuery, CancellationToken cancellationToken)
        {
            return notesQuery.ToListAsync(cancellationToken);
        }

        public Task<int> GetMaxDisplayOrderFromQueryAsync(IQueryable<Note> notesQuery, CancellationToken cancellationToken)
        {
            return notesQuery.MaxAsync(n => n.DisplayOrder, cancellationToken);
        }

        public Task<Note> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return _context.Notes.FindAsync(new object[] { id }, cancellationToken);
        }

        public Note Create(Note note)
        {
            var entry = _context.Add(note);
            return entry.Entity;
        }

        public void Update(Note note)
        {
            _context.Update(note);
        }

        public void Delete(Note note)
        {
            _context.Remove(note);
        }

        public void UpdateRange(IEnumerable<Note> notes)
        {
            _context.UpdateRange(notes);
        }

        public void DeleteRange(IEnumerable<Note> notes)
        {
            _context.RemoveRange(notes);
        }

        public IQueryable<Note> LoadProduct(IQueryable<Note> query)
        {
            return query.Include(n => n.Product);
        }
    }
}
