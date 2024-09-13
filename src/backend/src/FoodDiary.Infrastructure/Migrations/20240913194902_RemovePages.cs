using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace FoodDiary.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemovePages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notes_Pages_PageId",
                table: "Notes");

            migrationBuilder.DropTable(
                name: "Pages");

            migrationBuilder.DropIndex(
                name: "IX_Notes_PageId",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "PageId",
                table: "Notes");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PageId",
                table: "Notes",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Pages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Date = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pages", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Notes_PageId",
                table: "Notes",
                column: "PageId");

            migrationBuilder.CreateIndex(
                name: "IX_Pages_Date",
                table: "Pages",
                column: "Date",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Notes_Pages_PageId",
                table: "Notes",
                column: "PageId",
                principalTable: "Pages",
                principalColumn: "Id");
        }
    }
}
