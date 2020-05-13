namespace FoodDiary.Domain.Abstractions
{
    public interface IRepository<TEntity> where TEntity : class
    {
        IUnitOfWork UnitOfWork { get; }
    }
}
