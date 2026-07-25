using FoodDiary.Application.Notes.Delete;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;
using FoodDiary.Domain.Repositories;
using FoodDiary.Domain.Utils;
using Moq;

namespace FoodDiary.UnitTests.Notes.Delete;

public class DeleteNoteCommandHandlerTests
{
    private readonly Mock<INoteRepository> _repository = new();
    private readonly Mock<INotesOrderCalculator> _orderCalculator = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    public DeleteNoteCommandHandlerTests()
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
    public async Task Handle_NoteNotFound_ReturnsNotFound()
    {
        _repository.Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Note)null!);
        var handler = new DeleteNoteCommandHandler(_repository.Object, _orderCalculator.Object);

        var result = await handler.Handle(new DeleteNoteCommand(1), CancellationToken.None);

        result.Should().BeOfType<DeleteNoteResult.NotFound>();
        _repository.Verify(r => r.Remove(It.IsAny<Note>()), Times.Never);
        _orderCalculator.Verify(c => c.RecalculateDisplayOrders(It.IsAny<IEnumerable<Note>>(), It.IsAny<int>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NoteExists_RecalculatesRemainingOrdersRemovesAndReturnsSuccess()
    {
        var date = new DateOnly(2026, 7, 24);
        var target = new Note { Id = 1, Date = date, MealType = MealType.Breakfast };
        var sibling = new Note { Id = 2, Date = date, MealType = MealType.Breakfast };
        _repository.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(target);
        GivenNotes(target, sibling);
        var handler = new DeleteNoteCommandHandler(_repository.Object, _orderCalculator.Object);

        var result = await handler.Handle(new DeleteNoteCommand(1), CancellationToken.None);

        result.Should().BeOfType<DeleteNoteResult.Success>();
        _orderCalculator.Verify(
            c => c.RecalculateDisplayOrders(
                It.Is<IEnumerable<Note>>(notes => notes.Single().Id == 2),
                It.IsAny<int>()),
            Times.Once);
        _repository.Verify(r => r.Remove(target), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
