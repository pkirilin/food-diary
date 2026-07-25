using FoodDiary.Application.Notes.Delete;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;
using FoodDiary.Domain.Repositories;
using FoodDiary.Domain.Utils;
using Moq;

namespace FoodDiary.UnitTests.Notes.Delete;

public class DeleteNotesCommandHandlerTests
{
    private readonly Mock<INoteRepository> _repository = new();
    private readonly Mock<INotesOrderCalculator> _orderCalculator = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    public DeleteNotesCommandHandlerTests()
    {
        _repository.Setup(r => r.UnitOfWork).Returns(_unitOfWork.Object);
        _unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
    }

    private void GivenNotes(params Note[] notes)
    {
        _repository.Setup(r => r.GetQuery()).Returns(notes.AsQueryable());
        _repository
            .Setup(r => r.GetByQueryAsync(It.IsAny<IQueryable<Note>>(), It.IsAny<CancellationToken>()))
            .Returns((IQueryable<Note> q, CancellationToken _) => Task.FromResult(q.ToList()));
    }

    [Fact]
    public async Task Handle_MatchingNotes_RecalculatesRemainingOrdersRemovesAndReturnsSuccess()
    {
        var date = new DateOnly(2026, 7, 24);
        var delete1 = new Note { Id = 1, Date = date, MealType = MealType.Breakfast };
        var delete2 = new Note { Id = 2, Date = date, MealType = MealType.Breakfast };
        var remaining = new Note { Id = 3, Date = date, MealType = MealType.Breakfast };
        GivenNotes(delete1, delete2, remaining);
        var handler = new DeleteNotesCommandHandler(_repository.Object, _orderCalculator.Object);

        var result = await handler.Handle(new DeleteNotesCommand(new[] { 1, 2 }), CancellationToken.None);

        result.Should().BeOfType<DeleteNotesResult.Success>();
        _orderCalculator.Verify(
            c => c.RecalculateDisplayOrders(
                It.Is<IEnumerable<Note>>(notes => notes.Single().Id == 3),
                It.IsAny<int>()),
            Times.Once);
        _repository.Verify(r => r.RemoveRange(It.Is<IEnumerable<Note>>(notes => notes.Count() == 2)), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_NoMatchingNotes_ShortCircuitsToSuccessWithoutSideEffects()
    {
        GivenNotes();
        var handler = new DeleteNotesCommandHandler(_repository.Object, _orderCalculator.Object);

        var result = await handler.Handle(new DeleteNotesCommand(new[] { 99 }), CancellationToken.None);

        result.Should().BeOfType<DeleteNotesResult.Success>();
        _orderCalculator.Verify(c => c.RecalculateDisplayOrders(It.IsAny<IEnumerable<Note>>(), It.IsAny<int>()), Times.Never);
        _repository.Verify(r => r.RemoveRange(It.IsAny<IEnumerable<Note>>()), Times.Never);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
