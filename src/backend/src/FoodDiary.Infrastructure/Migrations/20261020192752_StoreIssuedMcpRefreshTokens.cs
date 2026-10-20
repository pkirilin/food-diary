using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoodDiary.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class StoreIssuedMcpRefreshTokens : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "McpCancelledRefreshTokenChains");

            migrationBuilder.DropTable(
                name: "McpRedeemedRefreshTokens");

            migrationBuilder.CreateTable(
                name: "McpRefreshTokens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FamilyId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExpiresAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UsedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    RevokedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_McpRefreshTokens", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_McpRefreshTokens_ExpiresAt",
                table: "McpRefreshTokens",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_McpRefreshTokens_FamilyId",
                table: "McpRefreshTokens",
                column: "FamilyId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "McpRefreshTokens");

            migrationBuilder.CreateTable(
                name: "McpCancelledRefreshTokenChains",
                columns: table => new
                {
                    ChainId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExpiresAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_McpCancelledRefreshTokenChains", x => x.ChainId);
                });

            migrationBuilder.CreateTable(
                name: "McpRedeemedRefreshTokens",
                columns: table => new
                {
                    TokenId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExpiresAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_McpRedeemedRefreshTokens", x => x.TokenId);
                });
        }
    }
}
