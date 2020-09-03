using System.Reflection;
using AutoMapper;
using FluentAssertions;
using FoodDiary.API;
using FoodDiary.API.Controllers.v1;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Utils;
using FoodDiary.Infrastructure.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Xunit;
using FoodDiary.API.Requests;
using FoodDiary.UnitTests.Attributes;
using System.Collections.Generic;
using MediatR;
using FoodDiary.Application.Notes.Requests;
using FoodDiary.Application.Products.Requests;
using AutoFixture;

namespace FoodDiary.UnitTests.Controllers
{
    public class NotesControllerTests
    {
        private readonly IMapper _mapper;
        private readonly Mock<IMediator> _mediatorMock = new Mock<IMediator>();

        public NotesControllerTests()
        {
            var serviceProvider = new ServiceCollection()
                .AddAutoMapper(Assembly.GetAssembly(typeof(AutoMapperProfile)))
                .AddTransient<ICaloriesCalculator, CaloriesCalculator>()
                .BuildServiceProvider();

            _mapper = serviceProvider.GetService<IMapper>();
        }

        public NotesController Sut => new NotesController(_mapper, _mediatorMock.Object);

        [Theory]
        [CustomAutoData]
        public async void GetNotes_ReturnsFilteredNotes_WhenModelStateIsValid(NotesSearchRequest request, List<Note> notes)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetNotesRequest>(r => r.PageId == request.PageId && r.MealType == request.MealType), default))
                .ReturnsAsync(notes);

            var result = await Sut.GetNotes(request, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetNotesRequest>(r => r.PageId == request.PageId && r.MealType == request.MealType), default), Times.Once);
            result.Should().BeOfType<OkObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void GetNotes_ReturnsBadRequest_WhenModelStateIsInvalid(NotesSearchRequest request, string errorMessage)
        {
            var controller = Sut;
            controller.ModelState.AddModelError(errorMessage, errorMessage);

            var result = await controller.GetNotes(request, default);

            _mediatorMock.Verify(m => m.Send(It.IsAny<GetNotesRequest>(), default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void CreateNote_CreatesNote_WhenProductFromNoteExists(
            NoteCreateEditRequest noteData,
            Product product)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetProductByIdRequest>(r => r.Id == noteData.ProductId), default))
                .ReturnsAsync(product);

            var result = await Sut.CreateNote(noteData, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetProductByIdRequest>(r => r.Id == noteData.ProductId), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.IsNotNull<CreateNoteRequest>(), default), Times.Once);
            result.Should().BeOfType<OkResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void CreateNote_ReturnsBadRequest_WhenModelStateIsInvalid(NoteCreateEditRequest noteData, string errorMessage)
        {
            var controller = Sut;
            controller.ModelState.AddModelError(errorMessage, errorMessage);

            var result = await controller.CreateNote(noteData, default);

            _mediatorMock.Verify(m => m.Send(It.IsAny<GetProductByIdRequest>(), default), Times.Never);
            _mediatorMock.Verify(m => m.Send(It.IsAny<CreateNoteRequest>(), default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void CreateNote_ReturnsBadRequest_WhenProductFromNoteDoesNotExist(NoteCreateEditRequest noteData)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetProductByIdRequest>(r => r.Id == noteData.ProductId), default))
                .ReturnsAsync(null as Product);

            var result = await Sut.CreateNote(noteData, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetProductByIdRequest>(r => r.Id == noteData.ProductId), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.IsAny<CreateNoteRequest>(), default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void EditNote_UpdatesNote_WhenRequestedNoteExists(
            int noteId,
            NoteCreateEditRequest updatedNoteData,
            Product productFromNote,
            Note noteForUpdate)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetProductByIdRequest>(r => r.Id == updatedNoteData.ProductId), default))
                .ReturnsAsync(productFromNote);
            _mediatorMock.Setup(m => m.Send(It.Is<GetNoteByIdRequest>(r => r.Id == noteId), default))
                .ReturnsAsync(noteForUpdate);
            
            var result = await Sut.EditNote(noteId, updatedNoteData, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetProductByIdRequest>(r => r.Id == updatedNoteData.ProductId), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.Is<GetNoteByIdRequest>(r => r.Id == noteId), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.IsNotNull<EditNoteRequest>(), default), Times.Once);
            result.Should().BeOfType<OkResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void EditNote_ReturnsBadRequest_WhenModelStateIsInvalid(
            int noteId,
            NoteCreateEditRequest updatedNoteData,
            string errorMessage)
        {
            var controller = Sut;
            controller.ModelState.AddModelError(errorMessage, errorMessage);

            var result = await controller.EditNote(noteId, updatedNoteData, default);

            _mediatorMock.Verify(m => m.Send(It.IsAny<GetProductByIdRequest>(), default), Times.Never);
            _mediatorMock.Verify(m => m.Send(It.IsAny<GetNoteByIdRequest>(), default), Times.Never);
            _mediatorMock.Verify(m => m.Send(It.IsAny<EditNoteRequest>(), default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void EditNote_ReturnsBadRequest_WhenProductFromNoteDoesNotExist(int noteId, NoteCreateEditRequest updatedNoteData)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetProductByIdRequest>(r => r.Id == updatedNoteData.ProductId), default))
                .ReturnsAsync(null as Product);

            var result = await Sut.EditNote(noteId, updatedNoteData, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetProductByIdRequest>(r => r.Id == updatedNoteData.ProductId), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.IsAny<GetNoteByIdRequest>(), default), Times.Never);
            _mediatorMock.Verify(m => m.Send(It.IsAny<EditNoteRequest>(), default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void EditNote_ReturnsNotFound_WhenRequestedNoteDoesNotExist(
            int noteId,
            NoteCreateEditRequest updatedNoteData,
            Product productFromNote)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetProductByIdRequest>(r => r.Id == updatedNoteData.ProductId), default))
                .ReturnsAsync(productFromNote);
            _mediatorMock.Setup(m => m.Send(It.Is<GetNoteByIdRequest>(r => r.Id == noteId), default))
                .ReturnsAsync(null as Note);

            var result = await Sut.EditNote(noteId, updatedNoteData, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetProductByIdRequest>(r => r.Id == updatedNoteData.ProductId), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.Is<GetNoteByIdRequest>(r => r.Id == noteId), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.IsAny<EditNoteRequest>(), default), Times.Never);
            result.Should().BeOfType<NotFoundResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void DeleteNote_DeletesNote_WhenRequestedNoteExists(int noteForDeleteId, Note noteForDelete)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetNoteByIdRequest>(r => r.Id == noteForDeleteId), default))
                .ReturnsAsync(noteForDelete);

            var result = await Sut.DeleteNote(noteForDeleteId, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetNoteByIdRequest>(r => r.Id == noteForDeleteId), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.IsNotNull<DeleteNoteRequest>(), default), Times.Once);
            result.Should().BeOfType<OkResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void DeleteNote_ReturnsNotFound_WhenRequestedNoteDoesNotExist(int noteForDeleteId)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetNoteByIdRequest>(r => r.Id == noteForDeleteId), default))
                .ReturnsAsync(null as Note);

            var result = await Sut.DeleteNote(noteForDeleteId, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetNoteByIdRequest>(r => r.Id == noteForDeleteId), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.IsAny<DeleteNoteRequest>(), default), Times.Never);
            result.Should().BeOfType<NotFoundResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void DeleteNotes_DeletesNotes(IEnumerable<int> notesForDeleteIds, List<Note> notesForDelete)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetNotesByIdsRequest>(r => r.Ids == notesForDeleteIds), default))
                .ReturnsAsync(notesForDelete);

            var result = await Sut.DeleteNotes(notesForDeleteIds, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetNotesByIdsRequest>(r => r.Ids == notesForDeleteIds), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.IsNotNull<DeleteNotesRequest>(), default), Times.Once);
            result.Should().BeOfType<OkResult>();
        }

        [Theory]
        [MemberData(nameof(MemberData_MoveNote_NoteCanBeMoved))]
        public async void MoveNote_MovesNoteSuccessfully_WhenNoteCanBeMoved(
            NoteMoveRequest moveRequest,
            Note noteForMove,
            int orderLimit)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetNoteByIdRequest>(r => r.Id == moveRequest.NoteId), default))
                .ReturnsAsync(noteForMove);
            _mediatorMock.Setup(m => m.Send(It.Is<GetOrderForNewNoteRequest>(r =>
                    r.PageId == noteForMove.PageId
                    && r.MealType == moveRequest.DestMeal), default))
                .ReturnsAsync(orderLimit);

            var result = await Sut.MoveNote(moveRequest, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetNoteByIdRequest>(r => r.Id == moveRequest.NoteId), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.Is<GetOrderForNewNoteRequest>(r =>
                    r.PageId == noteForMove.PageId
                    && r.MealType == moveRequest.DestMeal), default),
                Times.Once);
            _mediatorMock.Verify(m => m.Send(It.IsNotNull<MoveNoteRequest>(), default), Times.Once);
            result.Should().BeOfType<OkResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void MoveNote_ReturnsBadRequest_WhenModelStateIsInvalid(NoteMoveRequest moveRequest, string errorMessage)
        {
            var controller = Sut;
            controller.ModelState.AddModelError(errorMessage, errorMessage);

            var result = await controller.MoveNote(moveRequest, default);

            _mediatorMock.Verify(m => m.Send(It.IsAny<GetNoteByIdRequest>(), default), Times.Never);
            _mediatorMock.Verify(m => m.Send(It.IsAny<GetOrderForNewNoteRequest>(), default), Times.Never);
            _mediatorMock.Verify(m => m.Send(It.IsAny<MoveNoteRequest>(), default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void MoveNote_ReturnsNotFound_WhenNoteForMoveDoesNotExist(NoteMoveRequest moveRequest)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetNoteByIdRequest>(r => r.Id == moveRequest.NoteId), default))
                .ReturnsAsync(null as Note);

            var result = await Sut.MoveNote(moveRequest, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetNoteByIdRequest>(r => r.Id == moveRequest.NoteId), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.IsAny<GetOrderForNewNoteRequest>(), default), Times.Never);
            _mediatorMock.Verify(m => m.Send(It.IsAny<MoveNoteRequest>(), default), Times.Never);
            result.Should().BeOfType<NotFoundResult>();
        }

        [Theory]
        [MemberData(nameof(MemberData_MoveNote_WrongPosition))]
        public async void MoveNote_ReturnsBadRequest_WhenNoteCannotBeMoved(
            NoteMoveRequest moveRequest,
            Note noteForMove,
            int orderLimit)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetNoteByIdRequest>(r => r.Id == moveRequest.NoteId), default))
                .ReturnsAsync(noteForMove);
            _mediatorMock.Setup(m => m.Send(It.Is<GetOrderForNewNoteRequest>(r =>
                    r.PageId == noteForMove.PageId
                    && r.MealType == moveRequest.DestMeal), default))
                .ReturnsAsync(orderLimit);

            var result = await Sut.MoveNote(moveRequest, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetNoteByIdRequest>(r => r.Id == moveRequest.NoteId), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.Is<GetOrderForNewNoteRequest>(r =>
                    r.PageId == noteForMove.PageId
                    && r.MealType == moveRequest.DestMeal), default),
                Times.Once);
            _mediatorMock.Verify(m => m.Send(It.IsAny<MoveNoteRequest>(), default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        #region Test data

        public static IEnumerable<object[]> MemberData_MoveNote_NoteCanBeMoved
        {
            get
            {
                var fixture = Fixtures.Custom;

                var moveRequest = fixture.Build<NoteMoveRequest>()
                    .With(r => r.Position, 2)
                    .Create();

                yield return new object[] { moveRequest, fixture.Create<Note>(), 3 };
            }
        }

        public static IEnumerable<object[]> MemberData_MoveNote_WrongPosition
        {
            get
            {
                var fixture = Fixtures.Custom;

                var moveRequest1 = fixture.Build<NoteMoveRequest>()
                    .With(r => r.Position, -1)
                    .Create();
                var moveRequest2 = fixture.Build<NoteMoveRequest>()
                    .With(r => r.Position, 4)
                    .Create();

                yield return new object[] { moveRequest1, fixture.Create<Note>(), 3 };
                yield return new object[] { moveRequest2, fixture.Create<Note>(), 3 };
            }
        }

        #endregion
    }
}
