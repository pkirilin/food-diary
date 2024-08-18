using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoodDiary.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNoteDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "Date",
                table: "Notes",
                type: "date",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notes_Date",
                table: "Notes",
                column: "Date");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Notes_Date",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "Date",
                table: "Notes");
        }
    }
}
