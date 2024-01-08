using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Infrastructure;

public class Repository<TEntity> : IRepository<TEntity> where TEntity : class
{
    protected readonly DbContext _context;

    protected DbSet<TEntity> TargetDbSet => _context.Set<TEntity>();

    public Repository(DbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public virtual IQueryable<TEntity> GetQuery()
    {
        return TargetDbSet.AsQueryable();
    }

    public virtual IQueryable<TEntity> GetQueryWithoutTracking()
    {
        return GetQuery().AsNoTracking();
    }

    public virtual Task<List<TEntity>> GetAllAsync(CancellationToken cancellationToken)
    {
        return TargetDbSet.ToListAsync(cancellationToken);
    }

    public virtual Task<List<TEntity>> GetByQueryAsync(IQueryable<TEntity> query, CancellationToken cancellationToken)
    {
        return query.ToListAsync(cancellationToken);
    }

    public virtual Task<TEntity> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        return TargetDbSet.FindAsync(new object[] { id }, cancellationToken).AsTask();
    }

    public virtual Task<int> CountByQueryAsync(IQueryable<TEntity> query, CancellationToken cancellationToken)
    {
        return query.CountAsync(cancellationToken);
    }

    public virtual TEntity Add(TEntity entity)
    {
        var entry = TargetDbSet.Add(entity);
        return entry.Entity;
    }

    public virtual void Update(TEntity entity)
    {
        TargetDbSet.Update(entity);
    }

    public virtual void Remove(TEntity entity)
    {
        TargetDbSet.Remove(entity);
    }

    public virtual void AddRange(IEnumerable<TEntity> entities)
    {
        TargetDbSet.AddRange(entities);
    }

    public virtual void UpdateRange(IEnumerable<TEntity> entities)
    {
        TargetDbSet.UpdateRange(entities);
    }

    public virtual void RemoveRange(IEnumerable<TEntity> entities)
    {
        TargetDbSet.RemoveRange(entities);
    }

    public virtual IUnitOfWork UnitOfWork
    {
        get
        {
            if (!(_context is IUnitOfWork))
                throw new NotImplementedException($"{typeof(IUnitOfWork)} is not implemented in target context. Ensure that your DbContext implements unit of work interface");
            return _context as IUnitOfWork;
        }
    }
}