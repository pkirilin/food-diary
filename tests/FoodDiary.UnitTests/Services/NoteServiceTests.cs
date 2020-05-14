using System.Linq;
using AutoFixture;
using AutoFixture.Xunit2;
using FluentAssertions;
using FoodDiary.API.Services;
using FoodDiary.API.Services.Implementation;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;
using FoodDiary.Domain.Repositories;
using FoodDiary.UnitTests.Customizations;
using Moq;
using Xunit;
using FoodDiary.API.Requests;

namespace FoodDiary.UnitTests.Services
{
    public class NoteServiceTests
    {
        private readonly Mock<INoteRepository> _noteRepositoryMock;
        private readonly Mock<IProductRepository> _productRepositoryMock;
        private readonly Mock<INotesOrderService> _notesOrderServiceMock;
        private readonly IFixture _fixture;

        public NoteServiceTests()
        {
            _noteRepositoryMock = new Mock<INoteRepository>();
            _productRepositoryMock = new Mock<IProductRepository>();
            _notesOrderServiceMock = new Mock<INotesOrderService>();
            _fixture = SetupFixture();

            var unitOfWorkMock = new Mock<IUnitOfWork>();
            _noteRepositoryMock.SetupGet(r => r.UnitOfWork)
                .Returns(unitOfWorkMock.Object);
            _productRepositoryMock.SetupGet(r => r.UnitOfWork)
                .Returns(unitOfWorkMock.Object);
        }

        private IFixture SetupFixture()
        {
            var _fixture = new Fixture();
            _fixture.Customize(new FixtureWithCircularReferencesCustomization());
            return _fixture;
        }

        public INoteService NoteService => new NoteService(_noteRepositoryMock.Object, _productRepositoryMock.Object, _notesOrderServiceMock.Object);

        [Fact]
        public async void GetNoteByIdAsync_ReturnsNoteWithRequestedId()
        {
            var id = _fixture.Create<int>();
            var expectedNote = _fixture.Build<Note>()
                .With(n => n.Id, id)
                .Create();
            _noteRepositoryMock.Setup(r => r.GetByIdAsync(id, default))
                .ReturnsAsync(expectedNote);

            var result = await NoteService.GetNoteByIdAsync(id, default);

            _noteRepositoryMock.Verify(r => r.GetByIdAsync(id, default), Times.Once);
            result.Should().NotBeNull().And.Be(expectedNote);
        }

        [Theory]
        [InlineAutoData]
        [InlineAutoData(1)]
        [InlineAutoData(1, null)]
        [InlineAutoData(1, MealType.Breakfast)]
        public async void SearchNotesAsync_ReturnsNotesForRequestedParameters(int pageId, MealType? mealType)
        {
            var request = _fixture.Build<NotesSearchRequest>()
                .With(r => r.PageId, pageId)
                .With(r => r.MealType, mealType)
                .Create();
            var expectedNotes = _fixture.CreateMany<Note>().ToList();
            _noteRepositoryMock.Setup(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Note>>(), default))
                .ReturnsAsync(expectedNotes);

            var result = await NoteService.SearchNotesAsync(request, default);

            _noteRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _noteRepositoryMock.Verify(r => r.LoadProduct(It.IsNotNull<IQueryable<Note>>()), Times.Once);
            _noteRepositoryMock.Verify(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Note>>(), default), Times.Once);
            result.Should().Contain(expectedNotes);
        }

        [Fact]
        public async void GetNotesByIdsAsync_ReturnsNotesWithRequestedIds()
        {
            var expectedNotes = _fixture.CreateMany<Note>().ToList();
            var expectedNotesIds = expectedNotes.Select(n => n.Id);

            _noteRepositoryMock.Setup(r => r.GetListFromQueryAsync(It.IsAny<IQueryable<Note>>(), default))
                .ReturnsAsync(expectedNotes);

            var result = await NoteService.GetNotesByIdsAsync(expectedNotesIds, default);

            _noteRepositoryMock.Verify(r => r.GetQuery(), Times.Once);
            _noteRepositoryMock.Verify(r => r.GetListFromQueryAsync(It.IsAny<IQueryable<Note>>(), default), Times.Once);
            result.Should().Contain(expectedNotes);
        }

        [Fact]
        public async void ValidateNoteDataAsync_ReturnsTrue_WhenNoteDataIsValid()
        {
            var noteData = _fixture.Create<NoteCreateEditRequest>();
            var productForNote = _fixture.Create<Product>();
            _productRepositoryMock.Setup(r => r.GetByIdAsync(noteData.ProductId, default))
                .ReturnsAsync(productForNote);

            var result = await NoteService.ValidateNoteDataAsync(noteData, default);

            _productRepositoryMock.Verify(r => r.GetByIdAsync(noteData.ProductId, default), Times.Once);
            result.IsValid.Should().BeTrue();
        }

        [Fact]
        public async void CreateNoteAsync_CreatesNoteWithoutErrors()
        {
            var note = _fixture.Create<Note>();
            _noteRepositoryMock.Setup(r => r.Create(note))
                .Returns(note);

            var result = await NoteService.CreateNoteAsync(note, default);

            _notesOrderServiceMock.Verify(s => s.GetOrderForNewNoteAsync(note, default), Times.Once);
            _noteRepositoryMock.Verify(r => r.Create(note), Times.Once);
            _noteRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
            result.Should().Be(note);
        }

        [Fact]
        public async void EditNoteAsync_UpdatesNoteWithoutErrors()
        {
            var note = _fixture.Create<Note>();

            await NoteService.EditNoteAsync(note, default);

            _noteRepositoryMock.Verify(r => r.Update(note), Times.Once);
            _noteRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Fact]
        public async void DeleteNoteAsync_DeletesNoteWithoutErrors()
        {
            var note = _fixture.Create<Note>();

            await NoteService.DeleteNoteAsync(note, default);

            _notesOrderServiceMock.Verify(s => s.ReorderNotesOnDeleteAsync(note, default), Times.Once);
            _noteRepositoryMock.Verify(r => r.Delete(note), Times.Once);
            _noteRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Fact]
        public void AllNotesFetched_ReturnsTrue_WhenFetchedNotesContainsAllRequestedIds()
        {
            var fetchedNotes = _fixture.CreateMany<Note>();
            var requestedIds = fetchedNotes.Select(n => n.Id);

            var result = NoteService.AllNotesFetched(requestedIds, fetchedNotes);

            result.Should().BeTrue();
        }

        [Fact]
        public async void DeleteNotesAsync_DeletesNotesWithoutErrors()
        {
            var notesForDelete = _fixture.CreateMany<Note>();

            await NoteService.DeleteNotesAsync(notesForDelete, default);

            _notesOrderServiceMock.Verify(s => s.ReorderNotesOnDeleteRangeAsync(notesForDelete, default), Times.Once);
            _noteRepositoryMock.Verify(r => r.DeleteRange(notesForDelete), Times.Once);
            _noteRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Theory]
        [InlineData(0, 0)]
        [InlineData(1, 0)]
        [InlineData(1, 1)]
        [InlineData(2, 0)]
        [InlineData(2, 1)]
        [InlineData(2, 2)]
        public async void NoteCanBeMoved_ReturnsTrue_WhenRequestedPositionIsInAllowedRange(int expectedMaxDisplayOrder, int requestedPosition)
        {
            var noteForMove = _fixture.Create<Note>();
            var moveRequest = _fixture.Build<NoteMoveRequest>()
                .With(n => n.Position, requestedPosition)
                .Create();
            _noteRepositoryMock.Setup(r => r.GetMaxDisplayOrderFromQueryAsync(It.IsAny<IQueryable<Note>>(), default))
                .ReturnsAsync(expectedMaxDisplayOrder);

            var result = await NoteService.NoteCanBeMovedAsync(noteForMove, moveRequest, default);

            _noteRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _noteRepositoryMock.Verify(r => r.GetMaxDisplayOrderFromQueryAsync(It.IsAny<IQueryable<Note>>(), default), Times.Once);
            result.Should().BeTrue();
        }

        [Fact]
        public async void MoveNoteAsync_UpdatesNoteWithReordering()
        {
            var noteForMove = _fixture.Create<Note>();
            var moveRequest = _fixture.Create<NoteMoveRequest>();

            var result = await NoteService.MoveNoteAsync(noteForMove, moveRequest, default);

            _notesOrderServiceMock.Verify(s => s.ReorderNotesOnMoveAsync(noteForMove, moveRequest, default), Times.Once);
            _noteRepositoryMock.Verify(r => r.Update(noteForMove), Times.Once);
            _noteRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
            result.Should().Be(noteForMove);
        }
    }
}
